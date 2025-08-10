import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { type, agenda } = await req.json();

    const { data: notes } = await supabase
      .from('voice_memos')
      .select('transcript, created_at')
      .eq('user_id', user.id)
      .not('transcript', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    const notesText =
      (notes || [])
        .map((n) => `[${new Date(n.created_at).toLocaleDateString()}] ${n.transcript}`)
        .join('\n') || 'No prior notes.';

    if (type === 'agenda') {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: `Based on the user's recent voice notes below, propose a concise conversation agenda for today (3-5 bullets):\n\n### VOICE NOTES ###\n${notesText}`,
      });
      return Response.json({ text });
    }

    if (type === 'topic') {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: `Summarize this agenda into a short topic to use in: "For today's conversation, I thought we might discuss {topic}. How does that sound?"\n\n### AGENDA ###\n${agenda || ''}`,
      });
      return Response.json({ text });
    }

    if (type === 'contextQuery') {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: `Write a single, clear query to fetch just the most relevant context from the user's voice notes for the agenda below.\n\n### AGENDA ###\n${agenda || ''}`,
      });
      return Response.json({ text });
    }

    return new Response('Invalid type', { status: 400 });
  } catch (error) {
    console.error(error);
    return new Response('Server error', { status: 500 });
  }
}
