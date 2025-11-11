  -- Push Subscriptions Table for Web Push Notifications
  -- Run this in your Supabase SQL Editor

  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create index for faster lookups
  CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

  -- Enable Row Level Security
  ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

  -- Allow public insert (for users to subscribe)
  DROP POLICY IF EXISTS "Allow public insert on push_subscriptions" ON push_subscriptions;
  CREATE POLICY "Allow public insert on push_subscriptions" ON push_subscriptions
    FOR INSERT
    WITH CHECK (true);

  -- Allow public delete (for users to unsubscribe)
  DROP POLICY IF EXISTS "Allow public delete on push_subscriptions" ON push_subscriptions;
  CREATE POLICY "Allow public delete on push_subscriptions" ON push_subscriptions
    FOR DELETE
    USING (true);

  -- Allow admins to read all subscriptions
  DROP POLICY IF EXISTS "Allow admin read access on push_subscriptions" ON push_subscriptions;
  CREATE POLICY "Allow admin read access on push_subscriptions" ON push_subscriptions
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
      )
    );

  -- Note: Backend service uses service role key, so it bypasses RLS
  -- This is necessary for the backend to send push notifications

