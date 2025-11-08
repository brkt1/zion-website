-- Admin Policies for Supabase
-- Run this AFTER creating the tables and setting up authentication
-- This allows authenticated users to perform CRUD operations

-- First, you need to create an admin user in Supabase Auth
-- Go to Authentication > Users > Add User (or sign up through your app)

-- Events Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to update events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to delete events" ON events;

CREATE POLICY "Allow authenticated users to insert events" ON events
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update events" ON events
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete events" ON events
  FOR DELETE TO authenticated
  USING (true);

-- Categories Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON categories;

CREATE POLICY "Allow authenticated users to insert categories" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categories" ON categories
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete categories" ON categories
  FOR DELETE TO authenticated
  USING (true);

-- Destinations Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert destinations" ON destinations;
DROP POLICY IF EXISTS "Allow authenticated users to update destinations" ON destinations;
DROP POLICY IF EXISTS "Allow authenticated users to delete destinations" ON destinations;

CREATE POLICY "Allow authenticated users to insert destinations" ON destinations
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update destinations" ON destinations
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete destinations" ON destinations
  FOR DELETE TO authenticated
  USING (true);

-- Gallery Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery" ON gallery;
DROP POLICY IF EXISTS "Allow authenticated users to update gallery" ON gallery;
DROP POLICY IF EXISTS "Allow authenticated users to delete gallery" ON gallery;

CREATE POLICY "Allow authenticated users to insert gallery" ON gallery
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update gallery" ON gallery
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete gallery" ON gallery
  FOR DELETE TO authenticated
  USING (true);

-- About Content Policies
DROP POLICY IF EXISTS "Allow authenticated users to update about_content" ON about_content;
CREATE POLICY "Allow authenticated users to update about_content" ON about_content
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- About Values Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert about_values" ON about_values;
DROP POLICY IF EXISTS "Allow authenticated users to update about_values" ON about_values;
DROP POLICY IF EXISTS "Allow authenticated users to delete about_values" ON about_values;

CREATE POLICY "Allow authenticated users to insert about_values" ON about_values
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update about_values" ON about_values
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete about_values" ON about_values
  FOR DELETE TO authenticated
  USING (true);

-- About Milestones Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert about_milestones" ON about_milestones;
DROP POLICY IF EXISTS "Allow authenticated users to update about_milestones" ON about_milestones;
DROP POLICY IF EXISTS "Allow authenticated users to delete about_milestones" ON about_milestones;

CREATE POLICY "Allow authenticated users to insert about_milestones" ON about_milestones
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update about_milestones" ON about_milestones
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete about_milestones" ON about_milestones
  FOR DELETE TO authenticated
  USING (true);

-- Contact Info Policies
DROP POLICY IF EXISTS "Allow authenticated users to update contact_info" ON contact_info;
CREATE POLICY "Allow authenticated users to update contact_info" ON contact_info
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Social Links Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert social_links" ON social_links;
DROP POLICY IF EXISTS "Allow authenticated users to update social_links" ON social_links;
DROP POLICY IF EXISTS "Allow authenticated users to delete social_links" ON social_links;

CREATE POLICY "Allow authenticated users to insert social_links" ON social_links
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update social_links" ON social_links
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete social_links" ON social_links
  FOR DELETE TO authenticated
  USING (true);

-- Site Config Policies
DROP POLICY IF EXISTS "Allow authenticated users to update site_config" ON site_config;
CREATE POLICY "Allow authenticated users to update site_config" ON site_config
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Navigation Links Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert navigation_links" ON navigation_links;
DROP POLICY IF EXISTS "Allow authenticated users to update navigation_links" ON navigation_links;
DROP POLICY IF EXISTS "Allow authenticated users to delete navigation_links" ON navigation_links;

CREATE POLICY "Allow authenticated users to insert navigation_links" ON navigation_links
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update navigation_links" ON navigation_links
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete navigation_links" ON navigation_links
  FOR DELETE TO authenticated
  USING (true);

-- Home Content Policies
DROP POLICY IF EXISTS "Allow authenticated users to update home_content" ON home_content;
CREATE POLICY "Allow authenticated users to update home_content" ON home_content
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Home Categories Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert home_categories" ON home_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update home_categories" ON home_categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete home_categories" ON home_categories;

CREATE POLICY "Allow authenticated users to insert home_categories" ON home_categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update home_categories" ON home_categories
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete home_categories" ON home_categories
  FOR DELETE TO authenticated
  USING (true);

-- Home CTA Buttons Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert home_cta_buttons" ON home_cta_buttons;
DROP POLICY IF EXISTS "Allow authenticated users to update home_cta_buttons" ON home_cta_buttons;
DROP POLICY IF EXISTS "Allow authenticated users to delete home_cta_buttons" ON home_cta_buttons;

CREATE POLICY "Allow authenticated users to insert home_cta_buttons" ON home_cta_buttons
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update home_cta_buttons" ON home_cta_buttons
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete home_cta_buttons" ON home_cta_buttons
  FOR DELETE TO authenticated
  USING (true);

-- Hero Categories Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert hero_categories" ON hero_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update hero_categories" ON hero_categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete hero_categories" ON hero_categories;

CREATE POLICY "Allow authenticated users to insert hero_categories" ON hero_categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update hero_categories" ON hero_categories
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete hero_categories" ON hero_categories
  FOR DELETE TO authenticated
  USING (true);

-- Tickets Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert tickets" ON tickets;
DROP POLICY IF EXISTS "Allow authenticated users to update tickets" ON tickets;
DROP POLICY IF EXISTS "Allow authenticated users to delete tickets" ON tickets;
DROP POLICY IF EXISTS "Allow public to insert tickets" ON tickets;

-- Allow public to insert tickets (for payment webhooks and frontend)
CREATE POLICY "Allow public to insert tickets" ON tickets
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update tickets (for admin verification)
CREATE POLICY "Allow authenticated users to update tickets" ON tickets
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete tickets (for admin)
CREATE POLICY "Allow authenticated users to delete tickets" ON tickets
  FOR DELETE TO authenticated
  USING (true);

