INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('voice-memos', 'voice-memos', false, 52428800, ARRAY['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/wav', 'audio/ogg'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Users can view own voice memos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'voice-memos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own voice memos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'voice-memos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own voice memos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'voice-memos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own voice memos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'voice-memos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );