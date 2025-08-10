CREATE TABLE IF NOT EXISTS conversation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_logs_user_created ON conversation_logs(user_id, created_at DESC);

ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversation logs" ON conversation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation logs" ON conversation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);