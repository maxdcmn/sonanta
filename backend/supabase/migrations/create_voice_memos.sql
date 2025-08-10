CREATE TABLE IF NOT EXISTS public.voice_memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  audio_url TEXT NOT NULL,
  duration_seconds DECIMAL(10, 2),
  file_size_bytes BIGINT,
  
  transcript TEXT,
  transcript_status TEXT CHECK (transcript_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  transcript_metadata JSONB DEFAULT '{}'::jsonb,
  
  title TEXT,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  
  metadata JSONB DEFAULT '{}'::jsonb
);


CREATE INDEX idx_voice_memos_user_id ON public.voice_memos(user_id);
CREATE INDEX idx_voice_memos_created_at ON public.voice_memos(created_at DESC);
CREATE INDEX idx_voice_memos_tags ON public.voice_memos USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.voice_memos ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own memos
CREATE POLICY "Users can view own memos" ON public.voice_memos
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own memos
CREATE POLICY "Users can insert own memos" ON public.voice_memos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own memos
CREATE POLICY "Users can update own memos" ON public.voice_memos
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy: Users can delete their own memos
CREATE POLICY "Users can delete own memos" ON public.voice_memos
  FOR DELETE USING (auth.uid() = user_id);


CREATE TRIGGER update_voice_memos_updated_at BEFORE UPDATE ON public.voice_memos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();