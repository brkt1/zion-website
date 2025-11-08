# Supabase Setup Guide

## Step 1: Create Database Tables

1. Go to your Supabase project: https://supabase.com/dashboard/project/zjhnvtegoarvdqakqqkd
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click **Run** to execute the SQL

This will create all the necessary tables, enable Row Level Security (RLS), create policies for public read access, and insert sample data.

## Step 2: Configure Environment Variables

Create a `.env` file in the root of your project (if it doesn't exist) and add:

```env
REACT_APP_SUPABASE_URL=https://zjhnvtegoarvdqakqqkd.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII
```

## Step 3: Verify Tables

After running the SQL, verify that all tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - events
   - categories
   - destinations
   - gallery
   - about_content
   - about_values
   - about_milestones
   - contact_info
   - social_links
   - site_config
   - navigation_links
   - home_content
   - home_categories
   - home_cta_buttons
   - hero_categories

## Step 4: Test the Connection

1. Restart your React development server:
   ```bash
   npm start
   ```

2. Open your browser and check the console for any errors
3. The website should now load data from Supabase!

## Managing Data

You can manage all your website content directly in Supabase:

- **Events**: Add/edit events in the `events` table
- **Categories**: Manage categories in the `categories` table
- **Gallery**: Update gallery items in the `gallery` table
- **About Page**: Edit content in `about_content`, `about_values`, and `about_milestones` tables
- **Contact Info**: Update contact information in `contact_info` and `social_links` tables
- **Home Page**: Customize home page in `home_content`, `home_categories`, and `home_cta_buttons` tables

## Security

All tables have Row Level Security (RLS) enabled with public read access policies. This means:
- Anyone can read the data (perfect for a public website)
- Only authenticated users (if you add authentication later) can write data
- You can modify these policies in Supabase dashboard under **Authentication > Policies**

