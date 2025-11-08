-- Supabase Database Schema for Yenege Website
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('game', 'travel', 'corporate', 'community')),
  image TEXT,
  description TEXT NOT NULL,
  attendees INTEGER DEFAULT 0,
  max_attendees INTEGER,
  price TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  featured BOOLEAN DEFAULT false,
  gallery TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations Table (for Hero component)
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  img TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image TEXT NOT NULL,
  icon TEXT,
  main TEXT NOT NULL,
  sub TEXT NOT NULL,
  default_color TEXT NOT NULL,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Content Table
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_title TEXT,
  story_content TEXT,
  mission_title TEXT,
  mission_content TEXT,
  vision_title TEXT,
  vision_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Values Table
CREATE TABLE IF NOT EXISTS about_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Milestones Table
CREATE TABLE IF NOT EXISTS about_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Info Table
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_formatted TEXT,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Links Table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Config Table
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL,
  logo TEXT,
  footer_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Navigation Links Table
CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  label TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Home Content Table
CREATE TABLE IF NOT EXISTS home_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_slogan TEXT,
  hero_intro TEXT,
  cta_title TEXT,
  cta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Home Categories Table
CREATE TABLE IF NOT EXISTS home_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  number TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Home CTA Buttons Table
CREATE TABLE IF NOT EXISTS home_cta_buttons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  link TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('primary', 'secondary')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero Categories Table
CREATE TABLE IF NOT EXISTS hero_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_cta_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_categories ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read access on about_content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access on about_values" ON about_values FOR SELECT USING (true);
CREATE POLICY "Allow public read access on about_milestones" ON about_milestones FOR SELECT USING (true);
CREATE POLICY "Allow public read access on contact_info" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Allow public read access on social_links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Allow public read access on site_config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Allow public read access on navigation_links" ON navigation_links FOR SELECT USING (true);
CREATE POLICY "Allow public read access on home_content" ON home_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access on home_categories" ON home_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on home_cta_buttons" ON home_cta_buttons FOR SELECT USING (true);
CREATE POLICY "Allow public read access on hero_categories" ON hero_categories FOR SELECT USING (true);

-- Insert sample data
-- Categories
INSERT INTO categories (name, description, slug) VALUES
  ('Game Nights', 'Fun-filled game events', 'game'),
  ('Travel', 'Adventure and travel experiences', 'travel'),
  ('Corporate', 'Corporate events and team building', 'corporate'),
  ('Community', 'Community meetups and gatherings', 'community')
ON CONFLICT (slug) DO NOTHING;

-- Sample Events
INSERT INTO events (title, date, time, location, category, image, description, attendees, max_attendees, price, currency, featured, gallery) VALUES
  (
    'Friday Game Night',
    '2024-02-15',
    '6:00 PM',
    'Addis Ababa',
    'game',
    'https://images.unsplash.com/photo-1606166188517-c613235819d4?w=800',
    'Join us for an evening of board games, trivia, and fun!',
    25,
    50,
    '500',
    'ETB',
    true,
    ARRAY['https://images.unsplash.com/photo-1606166188517-c613235819d4?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400']
  ),
  (
    'Weekend Getaway to Debre Zeit',
    '2024-02-20',
    '8:00 AM',
    'Debre Zeit',
    'travel',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'Explore the beautiful lakes and enjoy a relaxing weekend.',
    15,
    30,
    '2500',
    'ETB',
    true,
    ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400']
  ),
  (
    'Community Meetup',
    '2024-02-25',
    '4:00 PM',
    'Addis Ababa',
    'community',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
    'Connect with fellow community members and share stories.',
    40,
    100,
    'Free',
    'ETB',
    true,
    ARRAY[]::TEXT[]
  )
ON CONFLICT DO NOTHING;

-- Contact Info
INSERT INTO contact_info (email, phone, phone_formatted, location) VALUES
  ('bereketyosef49@gmail.com', '+251978639887', '+251 978 639 887', 'Addis Ababa, Ethiopia')
ON CONFLICT DO NOTHING;

-- Social Links
INSERT INTO social_links (platform, url, display_order) VALUES
  ('Instagram', 'https://instagram.com/yenege', 1),
  ('Telegram', 'https://t.me/yenege', 2),
  ('TikTok', 'https://tiktok.com/@yenege', 3),
  ('YouTube', 'https://youtube.com/@yenege', 4)
ON CONFLICT DO NOTHING;

-- Site Config
INSERT INTO site_config (site_name, logo, footer_description) VALUES
  ('YENEGE', '/logo.png', 'Bringing happiness to life through events, adventures, and community connections.')
ON CONFLICT DO NOTHING;

-- Navigation Links
INSERT INTO navigation_links (path, label, display_order) VALUES
  ('/', 'Home', 1),
  ('/events', 'Events', 2),
  ('/about', 'About', 3),
  ('/contact', 'Contact', 4)
ON CONFLICT DO NOTHING;

-- About Content
INSERT INTO about_content (story_title, story_content, mission_title, mission_content, vision_title, vision_content) VALUES
  (
    'The Yenege Dream',
    'Yenege was born from a simple yet powerful vision: to bring happiness to life through meaningful connections and unforgettable experiences.

We believe that life''s greatest moments happen when people come together—whether it''s over a board game, on a weekend adventure, or simply sharing stories in a welcoming community space.

What started as a dream to create a space where people could escape the daily grind and truly connect has grown into a vibrant community of individuals who value joy, friendship, and living life to the fullest.

Every event we organize, every trip we plan, and every gathering we host is designed with one goal in mind: to bring a little more happiness into your life.',
    'Our Mission',
    'To create a vibrant community platform that brings people together through engaging events, exciting adventures, and meaningful connections, making happiness accessible to everyone.',
    'Our Vision',
    'To become the leading lifestyle and events platform in Ethiopia, known for creating unforgettable experiences and building a community where every member feels valued and happy.'
  )
ON CONFLICT DO NOTHING;

-- About Values
INSERT INTO about_values (number, title, description, display_order) VALUES
  ('01', 'Happiness First', 'Everything we do is centered around bringing joy and positivity into people''s lives.', 1),
  ('02', 'Community', 'We believe in the power of connection and building lasting friendships.', 2),
  ('03', 'Adventure', 'Life is meant to be explored. We encourage stepping out of comfort zones.', 3),
  ('04', 'Inclusivity', 'Everyone is welcome. We celebrate diversity and create safe spaces for all.', 4)
ON CONFLICT DO NOTHING;

-- About Milestones
INSERT INTO about_milestones (year, title, description, display_order) VALUES
  ('2024', 'Launch', 'Yenege officially launched with our first community events', 1),
  ('2024', 'Growth', 'Expanded to include travel adventures and corporate events', 2),
  ('Future', 'Expansion', 'Building towards becoming Ethiopia''s premier lifestyle platform', 3)
ON CONFLICT DO NOTHING;

-- Home Content
INSERT INTO home_content (hero_slogan, hero_intro, cta_title, cta_description) VALUES
  (
    'Bringing Happiness to Life',
    'Yenege is a vibrant community dedicated to creating unforgettable experiences. We bring people together through exciting game nights, amazing travel adventures, and meaningful connections that celebrate life''s beautiful moments.',
    'Ready to Join the Fun?',
    'Be part of a community that celebrates life, creates memories, and brings happiness to every moment.'
  )
ON CONFLICT DO NOTHING;

-- Hero Categories
INSERT INTO hero_categories (label, path, display_order) VALUES
  ('Game Nights', '/events?category=game', 1),
  ('Travel', '/events?category=travel', 2),
  ('Community', '/community', 3)
ON CONFLICT DO NOTHING;

-- Home Categories
INSERT INTO home_categories (title, description, link, number, display_order) VALUES
  ('Events', 'Fun-filled evenings with board games, trivia, and interactive challenges. Perfect for making new friends!', '/events?category=game', '01', 1),
  ('Travel & Adventures', 'Weekend getaways, day trips, and exciting adventures. Explore new places with amazing people.', '/events?category=travel', '02', 2),
  ('Community', 'Join a vibrant community of happy people. Share stories, connect, and build lasting friendships.', '/community', '03', 3)
ON CONFLICT DO NOTHING;

-- Home CTA Buttons
INSERT INTO home_cta_buttons (text, link, type, display_order) VALUES
  ('Explore Events', '/events', 'primary', 1),
  ('Contact via WhatsApp', 'https://wa.me/251978639887', 'secondary', 2)
ON CONFLICT DO NOTHING;

-- Destinations
INSERT INTO destinations (name, location, img, featured) VALUES
  ('Sahara', 'Marrakech', 'https://cdn.pixabay.com/photo/2021/11/26/17/26/dubai-desert-safari-6826298_1280.jpg', true),
  ('Maldives', 'Indian Ocean', 'https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg', true),
  ('Dolomites', 'Italy', 'https://cdn.pixabay.com/photo/2020/03/29/09/24/pale-di-san-martino-4979964_1280.jpg', true),
  ('Highland', 'Scotland', 'https://cdn.pixabay.com/photo/2014/11/21/03/26/neist-point-540119_1280.jpg', false),
  ('Kleifarvatn', 'Iceland', 'https://cdn.pixabay.com/photo/2017/03/02/16/54/iceland-2111811_1280.jpg', false),
  ('Taj Mahal', 'India', 'https://cdn.pixabay.com/photo/2023/08/19/13/26/ai-generated-8200484_1280.jpg', false),
  ('Colorado', 'Arizona', 'https://cdn.pixabay.com/photo/2016/11/29/03/13/desert-1867005_1280.jpg', false),
  ('Santorin', 'Greece', 'https://cdn.pixabay.com/photo/2017/01/30/07/54/church-2020258_1280.jpg', false),
  ('Petra', 'Jordan', 'https://cdn.pixabay.com/photo/2019/07/20/19/12/petra-4351361_1280.jpg', false),
  ('Fundy', 'Canada', 'https://cdn.pixabay.com/photo/2020/11/22/07/11/river-5765785_1280.jpg', false),
  ('Fuji', 'Japan', 'https://cdn.pixabay.com/photo/2016/12/12/22/31/japan-1902834_1280.jpg', false),
  ('Ha Long Bay', 'Vietnam', 'https://cdn.pixabay.com/photo/2022/10/21/10/00/marvel-7536676_1280.jpg', false)
ON CONFLICT DO NOTHING;

-- Gallery
INSERT INTO gallery (image, icon, main, sub, default_color, display_order) VALUES
  ('https://cdn.pixabay.com/photo/2016/11/29/03/13/desert-1867005_1280.jpg', 'walking', 'Adventures', 'Explore amazing destinations', '#ED5565', 1),
  ('https://cdn.pixabay.com/photo/2017/03/02/16/54/iceland-2111811_1280.jpg', 'snowflake', 'Winter Escapes', 'Snowy mountain adventures', '#FC6E51', 2),
  ('https://cdn.pixabay.com/photo/2014/11/21/03/26/neist-point-540119_1280.jpg', 'tree', 'Nature Trails', 'Discover natural beauty', '#FFCE54', 3),
  ('https://cdn.pixabay.com/photo/2020/11/22/07/11/river-5765785_1280.jpg', 'tint', 'Waterfalls', 'Majestic water wonders', '#2ECC71', 4),
  ('https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg', 'sun', 'Sunset Views', 'Beautiful golden hours', '#5D9CEC', 5)
ON CONFLICT DO NOTHING;

