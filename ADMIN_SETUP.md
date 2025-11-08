# Admin Dashboard Setup Guide

## Step 1: Set Up Authentication in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/zjhnvtegoarvdqakqqkd
2. Navigate to **Authentication** > **Users**
3. Click **Add User** or **Invite User**
4. Create an admin user with email and password
5. Note: You can also enable email signup in Authentication > Settings > Auth Providers

## Step 2: Run Admin Policies SQL

1. Go to **SQL Editor** in Supabase
2. Copy and paste the contents of `supabase-admin-policies.sql`
3. Click **Run**

This will allow authenticated users to perform CRUD operations on all tables.

## Step 3: Access the Admin Dashboard

1. Start your React app: `npm start`
2. Navigate to: `http://localhost:3000/admin/login`
3. Login with your admin credentials
4. You'll be redirected to the dashboard at `/admin/dashboard`

## Admin Dashboard Features

### Available Management Pages:

1. **Events** (`/admin/events`)
   - Create, edit, delete events
   - Set featured events
   - Manage event details, pricing, attendees

2. **Categories** (`/admin/categories`)
   - Manage event categories
   - Add/edit category names, slugs, descriptions

3. **Destinations** (`/admin/destinations`)
   - Manage hero destinations
   - Add/edit destination images and locations
   - Mark destinations as featured

4. **Gallery** (`/admin/gallery`)
   - Manage gallery items
   - Add/edit gallery images and descriptions

5. **Home Content** (`/admin/home`)
   - Edit hero section (slogan, intro, categories)
   - Manage home page categories
   - Configure CTA buttons

6. **About Content** (`/admin/about`)
   - Edit story, mission, vision
   - Manage values and milestones

7. **Contact Info** (`/admin/contact`)
   - Update contact information
   - Manage social media links

8. **Site Settings** (`/admin/settings`)
   - Configure site name and logo
   - Manage navigation links
   - Update footer description

## Security Notes

- All admin routes are protected and require authentication
- Only authenticated users can perform CRUD operations
- Public users can only read data (view the website)
- Make sure to use strong passwords for admin accounts

## Troubleshooting

If you can't login:
1. Check that the user exists in Supabase Authentication
2. Verify email confirmation is not required (or confirm the email)
3. Check browser console for errors
4. Ensure Supabase credentials are correct in `.env` file

