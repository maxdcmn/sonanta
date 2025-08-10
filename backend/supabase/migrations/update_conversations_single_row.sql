-- Drop the conversation_messages table as we're storing everything in conversations table
DROP TABLE IF EXISTS public.conversation_messages CASCADE;

-- Update conversations table to store the entire conversation
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS transcript JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS elevenlabs_conversation_id TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Add index for elevenlabs_conversation_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_conversations_elevenlabs_id ON public.conversations(elevenlabs_conversation_id);

-- Comment on columns for clarity
COMMENT ON COLUMN public.conversations.transcript IS 'Full conversation transcript from ElevenLabs webhook';
COMMENT ON COLUMN public.conversations.summary IS 'AI-generated summary of the conversation';
COMMENT ON COLUMN public.conversations.duration_seconds IS 'Total duration of the conversation in seconds';
COMMENT ON COLUMN public.conversations.ended_at IS 'Timestamp when the conversation ended';
COMMENT ON COLUMN public.conversations.elevenlabs_conversation_id IS 'ID from ElevenLabs for webhook correlation';
COMMENT ON COLUMN public.conversations.audio_url IS 'URL to the conversation audio recording';