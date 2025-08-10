import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { allowRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = allowRateLimit(`transcribe:${user.id}`, 20, 15 * 60000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString() },
      },
    );
  }

  const { memoId, filePath } = await request.json();

  if (!memoId || !filePath) {
    return NextResponse.json({ error: 'Missing memoId or filePath' }, { status: 400 });
  }

  try {
    const { data: memo, error: memoError } = await supabase
      .from('voice_memos')
      .select('id, audio_url')
      .eq('id', memoId)
      .eq('user_id', user.id)
      .single();

    if (memoError || !memo) {
      return NextResponse.json({ error: 'Voice memo not found' }, { status: 404 });
    }

    await supabase
      .from('voice_memos')
      .update({ transcript_status: 'processing' })
      .eq('id', memoId)
      .eq('user_id', user.id);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('voice-memos')
      .download(filePath);

    if (downloadError) {
      throw downloadError;
    }

    const formData = new FormData();
    formData.append('file', fileData, 'audio.webm');
    formData.append('model_id', 'scribe_v1');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const result = await response.json();
    const transcript = result.text;

    await supabase
      .from('voice_memos')
      .update({
        transcript,
        transcript_status: 'completed',
        transcript_metadata: { provider: 'elevenlabs' },
      })
      .eq('id', memoId)
      .eq('user_id', user.id);

    return NextResponse.json({ success: true, transcript });
  } catch (error) {
    console.error('Transcription error:', error);

    await supabase
      .from('voice_memos')
      .update({ transcript_status: 'failed' })
      .eq('id', memoId)
      .eq('user_id', user.id);

    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
