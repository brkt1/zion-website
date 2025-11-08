-- Commission Ticket Sellers Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS commission_sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  commission_rate NUMERIC NOT NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('percentage', 'fixed')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_commission_sellers_email ON commission_sellers(email);
CREATE INDEX IF NOT EXISTS idx_commission_sellers_is_active ON commission_sellers(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE commission_sellers ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access (for verification purposes)
DROP POLICY IF EXISTS "Allow public read access on commission_sellers" ON commission_sellers;
CREATE POLICY "Allow public read access on commission_sellers" ON commission_sellers FOR SELECT USING (true);

-- Only admins can insert, update, or delete
DROP POLICY IF EXISTS "Allow admin insert on commission_sellers" ON commission_sellers;
CREATE POLICY "Allow admin insert on commission_sellers" ON commission_sellers FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow admin update on commission_sellers" ON commission_sellers;
CREATE POLICY "Allow admin update on commission_sellers" ON commission_sellers FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow admin delete on commission_sellers" ON commission_sellers;
CREATE POLICY "Allow admin delete on commission_sellers" ON commission_sellers FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

