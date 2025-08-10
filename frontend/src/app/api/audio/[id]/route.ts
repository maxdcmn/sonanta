import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const { data: memo, error: memoError } = await supabase
      .from('voice_memos')
      .select('audio_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (memoError || !memo) {
      return NextResponse.json({ error: 'Voice memo not found' }, { status: 404 });
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('voice-memos')
      .download(memo.audio_url);

    if (downloadError) {
      throw downloadError;
    }

    const arrayBuffer = await fileData.arrayBuffer();

    const filename = `voice-memo-${id}.webm`;

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/webm',
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Audio serving error:', error);
    return NextResponse.json({ error: 'Failed to serve audio file' }, { status: 500 });
  }
}
