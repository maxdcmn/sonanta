import { NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export async function GET(request: Request) {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is not configured' }, { status: 500 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY is not configured' }, { status: 500 });
    }

    const client = new ElevenLabsClient({ apiKey });

    // Using conversations.getSignedUrl to match current SDK
    const response = await client.conversationalAi.conversations.getSignedUrl({
      agentId,
    });

    return NextResponse.json({ signedUrl: response.signedUrl });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 });
  }
}
