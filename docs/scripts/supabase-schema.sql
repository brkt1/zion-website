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

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_ref TEXT NOT NULL UNIQUE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  event_title TEXT,
  customer_name TEXT,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  chapa_reference TEXT,
  qr_code_data JSONB,
  payment_date TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on tx_ref for faster lookups
CREATE INDEX IF NOT EXISTS idx_tickets_tx_ref ON tickets(tx_ref);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON tickets(customer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

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
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
DROP POLICY IF EXISTS "Allow public read access on events" ON events;
CREATE POLICY "Allow public read access on events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on destinations" ON destinations;
CREATE POLICY "Allow public read access on destinations" ON destinations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on gallery" ON gallery;
CREATE POLICY "Allow public read access on gallery" ON gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on about_content" ON about_content;
CREATE POLICY "Allow public read access on about_content" ON about_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on about_values" ON about_values;
CREATE POLICY "Allow public read access on about_values" ON about_values FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on about_milestones" ON about_milestones;
CREATE POLICY "Allow public read access on about_milestones" ON about_milestones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on contact_info" ON contact_info;
CREATE POLICY "Allow public read access on contact_info" ON contact_info FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on social_links" ON social_links;
CREATE POLICY "Allow public read access on social_links" ON social_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on site_config" ON site_config;
CREATE POLICY "Allow public read access on site_config" ON site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on navigation_links" ON navigation_links;
CREATE POLICY "Allow public read access on navigation_links" ON navigation_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on home_content" ON home_content;
CREATE POLICY "Allow public read access on home_content" ON home_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on home_categories" ON home_categories;
CREATE POLICY "Allow public read access on home_categories" ON home_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on home_cta_buttons" ON home_cta_buttons;
CREATE POLICY "Allow public read access on home_cta_buttons" ON home_cta_buttons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on hero_categories" ON hero_categories;
CREATE POLICY "Allow public read access on hero_categories" ON hero_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on tickets" ON tickets;
CREATE POLICY "Allow public read access on tickets" ON tickets FOR SELECT USING (true);

-- Insert sample data
-- Categories
INSERT INTO categories (name, description, slug) VALUES
  ('Game Nights', 'Fun-filled game events', 'game'),
  ('Travel', 'Adventure and travel experiences', 'travel'),
  ('Corporate', 'Corporate events and team building', 'corporate'),
  ('Community', 'Community meetups and gatherings', 'community')
ON CONFLICT (slug) DO NOTHING;

-- Sample Events
INSERT INTO events (title, date, time, location, category, image, description, attendees, max_attendees, price, currency, featured, gallery)
SELECT * FROM (VALUES
  (
    'Friday Game Night'::TEXT,
    '2024-02-15'::DATE,
    '6:00 PM'::TEXT,
    'Addis Ababa'::TEXT,
    'game'::TEXT,
    'https://images.unsplash.com/photo-1606166188517-c613235819d4?w=800'::TEXT,
    'Join us for an evening of board games, trivia, and fun!'::TEXT,
    25::INTEGER,
    50::INTEGER,
    '500'::TEXT,
    'ETB'::TEXT,
    true::BOOLEAN,
    ARRAY['https://images.unsplash.com/photo-1606166188517-c613235819d4?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400']::TEXT[]
  ),
  (
    'Weekend Getaway to Debre Zeit'::TEXT,
    '2024-02-20'::DATE,
    '8:00 AM'::TEXT,
    'Debre Zeit'::TEXT,
    'travel'::TEXT,
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'::TEXT,
    'Explore the beautiful lakes and enjoy a relaxing weekend.'::TEXT,
    15::INTEGER,
    30::INTEGER,
    '2500'::TEXT,
    'ETB'::TEXT,
    true::BOOLEAN,
    ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400']::TEXT[]
  ),
  (
    'Community Meetup'::TEXT,
    '2024-02-25'::DATE,
    '4:00 PM'::TEXT,
    'Addis Ababa'::TEXT,
    'community'::TEXT,
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800'::TEXT,
    'Connect with fellow community members and share stories.'::TEXT,
    40::INTEGER,
    100::INTEGER,
    'Free'::TEXT,
    'ETB'::TEXT,
    true::BOOLEAN,
    ARRAY[]::TEXT[]
  )
) AS v(title, date, time, location, category, image, description, attendees, max_attendees, price, currency, featured, gallery)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE events.title = v.title AND events.date = v.date);

-- Contact Info
INSERT INTO contact_info (email, phone, phone_formatted, location)
SELECT 'bereketyosef49@gmail.com', '+251978639887', '+251 978 639 887', 'Addis Ababa, Ethiopia'
WHERE NOT EXISTS (SELECT 1 FROM contact_info WHERE email = 'bereketyosef49@gmail.com');

-- Social Links
INSERT INTO social_links (platform, url, display_order)
SELECT * FROM (VALUES
  ('Instagram'::TEXT, 'https://instagram.com/yenege'::TEXT, 1::INTEGER),
  ('Telegram'::TEXT, 'https://t.me/yenege'::TEXT, 2::INTEGER),
  ('TikTok'::TEXT, 'https://tiktok.com/@yenege'::TEXT, 3::INTEGER),
  ('YouTube'::TEXT, 'https://youtube.com/@yenege'::TEXT, 4::INTEGER)
) AS v(platform, url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM social_links WHERE social_links.platform = v.platform);

-- Site Config
INSERT INTO site_config (site_name, logo, footer_description)
SELECT 'YENEGE', '/logo.png', 'Bringing happiness to life through events, adventures, and community connections.'
WHERE NOT EXISTS (SELECT 1 FROM site_config LIMIT 1);

-- Navigation Links
INSERT INTO navigation_links (path, label, display_order)
SELECT * FROM (VALUES
  ('/'::TEXT, 'Home'::TEXT, 1::INTEGER),
  ('/events'::TEXT, 'Events'::TEXT, 2::INTEGER),
  ('/about'::TEXT, 'About'::TEXT, 3::INTEGER),
  ('/contact'::TEXT, 'Contact'::TEXT, 4::INTEGER)
) AS v(path, label, display_order)
WHERE NOT EXISTS (SELECT 1 FROM navigation_links WHERE navigation_links.path = v.path);

-- About Content
INSERT INTO about_content (story_title, story_content, mission_title, mission_content, vision_title, vision_content)
SELECT 
  'The Yenege Dream',
  'Yenege was born from a simple yet powerful vision: to bring happiness to life through meaningful connections and unforgettable experiences.

We believe that life''s greatest moments happen when people come together—whether it''s over a board game, on a weekend adventure, or simply sharing stories in a welcoming community space.

What started as a dream to create a space where people could escape the daily grind and truly connect has grown into a vibrant community of individuals who value joy, friendship, and living life to the fullest.

Every event we organize, every trip we plan, and every gathering we host is designed with one goal in mind: to bring a little more happiness into your life.',
  'Our Mission',
  'To create a vibrant community platform that brings people together through engaging events, exciting adventures, and meaningful connections, making happiness accessible to everyone.',
  'Our Vision',
  'To become the leading lifestyle and events platform in Ethiopia, known for creating unforgettable experiences and building a community where every member feels valued and happy.'
WHERE NOT EXISTS (SELECT 1 FROM about_content LIMIT 1);

-- About Values
INSERT INTO about_values (number, title, description, display_order)
SELECT * FROM (VALUES
  ('01'::TEXT, 'Happiness First'::TEXT, 'Everything we do is centered around bringing joy and positivity into people''s lives.'::TEXT, 1::INTEGER),
  ('02'::TEXT, 'Community'::TEXT, 'We believe in the power of connection and building lasting friendships.'::TEXT, 2::INTEGER),
  ('03'::TEXT, 'Adventure'::TEXT, 'Life is meant to be explored. We encourage stepping out of comfort zones.'::TEXT, 3::INTEGER),
  ('04'::TEXT, 'Inclusivity'::TEXT, 'Everyone is welcome. We celebrate diversity and create safe spaces for all.'::TEXT, 4::INTEGER)
) AS v(number, title, description, display_order)
WHERE NOT EXISTS (SELECT 1 FROM about_values WHERE about_values.number = v.number);

-- About Milestones
INSERT INTO about_milestones (year, title, description, display_order)
SELECT * FROM (VALUES
  ('2024'::TEXT, 'Launch'::TEXT, 'Yenege officially launched with our first community events'::TEXT, 1::INTEGER),
  ('2024'::TEXT, 'Growth'::TEXT, 'Expanded to include travel adventures and corporate events'::TEXT, 2::INTEGER),
  ('Future'::TEXT, 'Expansion'::TEXT, 'Building towards becoming Ethiopia''s premier lifestyle platform'::TEXT, 3::INTEGER)
) AS v(year, title, description, display_order)
WHERE NOT EXISTS (SELECT 1 FROM about_milestones WHERE about_milestones.year = v.year AND about_milestones.title = v.title);

-- Home Content
INSERT INTO home_content (hero_slogan, hero_intro, cta_title, cta_description)
SELECT 
  'Bringing Happiness to Life',
  'Yenege is a vibrant community dedicated to creating unforgettable experiences. We bring people together through exciting game nights, amazing travel adventures, and meaningful connections that celebrate life''s beautiful moments.',
  'Ready to Join the Fun?',
  'Be part of a community that celebrates life, creates memories, and brings happiness to every moment.'
WHERE NOT EXISTS (SELECT 1 FROM home_content LIMIT 1);

-- Hero Categories
INSERT INTO hero_categories (label, path, display_order)
SELECT * FROM (VALUES
  ('Game Nights'::TEXT, '/events?category=game'::TEXT, 1::INTEGER),
  ('Travel'::TEXT, '/events?category=travel'::TEXT, 2::INTEGER),
  ('Community'::TEXT, '/community'::TEXT, 3::INTEGER)
) AS v(label, path, display_order)
WHERE NOT EXISTS (SELECT 1 FROM hero_categories WHERE hero_categories.label = v.label);

-- Home Categories
INSERT INTO home_categories (title, description, link, number, display_order)
SELECT * FROM (VALUES
  ('Events'::TEXT, 'Fun-filled evenings with board games, trivia, and interactive challenges. Perfect for making new friends!'::TEXT, '/events?category=game'::TEXT, '01'::TEXT, 1::INTEGER),
  ('Travel & Adventures'::TEXT, 'Weekend getaways, day trips, and exciting adventures. Explore new places with amazing people.'::TEXT, '/events?category=travel'::TEXT, '02'::TEXT, 2::INTEGER),
  ('Community'::TEXT, 'Join a vibrant community of happy people. Share stories, connect, and build lasting friendships.'::TEXT, '/community'::TEXT, '03'::TEXT, 3::INTEGER)
) AS v(title, description, link, number, display_order)
WHERE NOT EXISTS (SELECT 1 FROM home_categories WHERE home_categories.title = v.title);

-- Home CTA Buttons
INSERT INTO home_cta_buttons (text, link, type, display_order)
SELECT * FROM (VALUES
  ('Explore Events'::TEXT, '/events'::TEXT, 'primary'::TEXT, 1::INTEGER),
  ('Contact via WhatsApp'::TEXT, 'https://wa.me/251978639887'::TEXT, 'secondary'::TEXT, 2::INTEGER)
) AS v(text, link, type, display_order)
WHERE NOT EXISTS (SELECT 1 FROM home_cta_buttons WHERE home_cta_buttons.text = v.text AND home_cta_buttons.link = v.link);

-- Destinations
INSERT INTO destinations (name, location, img, featured)
SELECT * FROM (VALUES
  ('Sahara'::TEXT, 'Marrakech'::TEXT, 'https://cdn.pixabay.com/photo/2021/11/26/17/26/dubai-desert-safari-6826298_1280.jpg'::TEXT, true::BOOLEAN),
  ('Maldives'::TEXT, 'Indian Ocean'::TEXT, 'https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg'::TEXT, true::BOOLEAN),
  ('Dolomites'::TEXT, 'Italy'::TEXT, 'https://cdn.pixabay.com/photo/2020/03/29/09/24/pale-di-san-martino-4979964_1280.jpg'::TEXT, true::BOOLEAN),
  ('Highland'::TEXT, 'Scotland'::TEXT, 'https://cdn.pixabay.com/photo/2014/11/21/03/26/neist-point-540119_1280.jpg'::TEXT, false::BOOLEAN),
  ('Kleifarvatn'::TEXT, 'Iceland'::TEXT, 'https://cdn.pixabay.com/photo/2017/03/02/16/54/iceland-2111811_1280.jpg'::TEXT, false::BOOLEAN),
  ('Taj Mahal'::TEXT, 'India'::TEXT, 'https://cdn.pixabay.com/photo/2023/08/19/13/26/ai-generated-8200484_1280.jpg'::TEXT, false::BOOLEAN),
  ('Colorado'::TEXT, 'Arizona'::TEXT, 'https://cdn.pixabay.com/photo/2016/11/29/03/13/desert-1867005_1280.jpg'::TEXT, false::BOOLEAN),
  ('Santorin'::TEXT, 'Greece'::TEXT, 'https://cdn.pixabay.com/photo/2017/01/30/07/54/church-2020258_1280.jpg'::TEXT, false::BOOLEAN),
  ('Petra'::TEXT, 'Jordan'::TEXT, 'https://cdn.pixabay.com/photo/2019/07/20/19/12/petra-4351361_1280.jpg'::TEXT, false::BOOLEAN),
  ('Fundy'::TEXT, 'Canada'::TEXT, 'https://cdn.pixabay.com/photo/2020/11/22/07/11/river-5765785_1280.jpg'::TEXT, false::BOOLEAN),
  ('Fuji'::TEXT, 'Japan'::TEXT, 'https://cdn.pixabay.com/photo/2016/12/12/22/31/japan-1902834_1280.jpg'::TEXT, false::BOOLEAN),
  ('Ha Long Bay'::TEXT, 'Vietnam'::TEXT, 'https://cdn.pixabay.com/photo/2022/10/21/10/00/marvel-7536676_1280.jpg'::TEXT, false::BOOLEAN)
) AS v(name, location, img, featured)
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE destinations.name = v.name AND destinations.location = v.location);

-- Gallery
INSERT INTO gallery (image, icon, main, sub, default_color, display_order)
SELECT * FROM (VALUES
  ('https://cdn.pixabay.com/photo/2016/11/29/03/13/desert-1867005_1280.jpg'::TEXT, 'walking'::TEXT, 'Adventures'::TEXT, 'Explore amazing destinations'::TEXT, '#ED5565'::TEXT, 1::INTEGER),
  ('https://cdn.pixabay.com/photo/2017/03/02/16/54/iceland-2111811_1280.jpg'::TEXT, 'snowflake'::TEXT, 'Winter Escapes'::TEXT, 'Snowy mountain adventures'::TEXT, '#FC6E51'::TEXT, 2::INTEGER),
  ('https://cdn.pixabay.com/photo/2014/11/21/03/26/neist-point-540119_1280.jpg'::TEXT, 'tree'::TEXT, 'Nature Trails'::TEXT, 'Discover natural beauty'::TEXT, '#FFCE54'::TEXT, 3::INTEGER),
  ('https://cdn.pixabay.com/photo/2020/11/22/07/11/river-5765785_1280.jpg'::TEXT, 'tint'::TEXT, 'Waterfalls'::TEXT, 'Majestic water wonders'::TEXT, '#2ECC71'::TEXT, 4::INTEGER),
  ('https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg'::TEXT, 'sun'::TEXT, 'Sunset Views'::TEXT, 'Beautiful golden hours'::TEXT, '#5D9CEC'::TEXT, 5::INTEGER)
) AS v(image, icon, main, sub, default_color, display_order)
WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE gallery.main = v.main);

