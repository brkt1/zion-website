-- Create CEO social links table
CREATE TABLE IF NOT EXISTS ceo_social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE ceo_social_links ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (Read)
DROP POLICY IF EXISTS "Allow public read access on ceo_social_links" ON ceo_social_links;
CREATE POLICY "Allow public read access on ceo_social_links" ON ceo_social_links FOR SELECT USING (true);

-- Create policies for authenticated access (Insert/Update/Delete)
DROP POLICY IF EXISTS "Allow authenticated users to insert ceo_social_links" ON ceo_social_links;
CREATE POLICY "Allow authenticated users to insert ceo_social_links" ON ceo_social_links
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update ceo_social_links" ON ceo_social_links;
CREATE POLICY "Allow authenticated users to update ceo_social_links" ON ceo_social_links
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete ceo_social_links" ON ceo_social_links;
CREATE POLICY "Allow authenticated users to delete ceo_social_links" ON ceo_social_links
    FOR DELETE USING (auth.role() = 'authenticated');
