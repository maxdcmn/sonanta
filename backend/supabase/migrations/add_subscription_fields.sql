CREATE TABLE subscription_tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    monthly_recording_minutes INTEGER NOT NULL,
    monthly_conversation_minutes INTEGER NOT NULL,
    monthly_price_cents INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id TEXT NOT NULL REFERENCES subscription_tiers(id) DEFAULT 'free',
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

INSERT INTO subscription_tiers (id, name, monthly_recording_minutes, monthly_conversation_minutes, monthly_price_cents) VALUES
    ('free', 'Free', 60, 10, 0),
    ('pro', 'Pro', 600, 120, 900),
    ('dev', 'Developer', 999999, 999999, 999999);

CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tiers" ON subscription_tiers
    FOR SELECT USING (id != 'dev');

CREATE POLICY "Users can view own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);