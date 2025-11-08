-- Supabase Storage Setup for Event Images
-- Run this in your Supabase SQL Editor

-- Note: Storage buckets must be created through the Supabase Dashboard UI
-- This SQL file provides the RLS policies for the bucket

-- Step 1: Create the bucket manually in Supabase Dashboard
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name it: event-images
-- 4. Make it PUBLIC (so images can be accessed via URL)
-- 5. Click "Create bucket"

-- Step 2: After creating the bucket, run the policies below

-- Enable RLS on storage.objects (if not already enabled)
-- Note: RLS is enabled by default on storage.objects

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

-- Policy: Allow public read access (so images can be displayed)
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'event-images'
);

-- Alternative: If you want to allow ALL authenticated users (not just admins) to upload:
-- You can use the policies above, or create a more restrictive policy:

-- Alternative: If you want to allow only admin users to upload (if you have a user_roles table)
-- First drop the existing upload policy, then create this one:
-- DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
-- CREATE POLICY "Allow admin uploads"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'event-images' AND
--   EXISTS (
--     SELECT 1 FROM user_roles
--     WHERE user_roles.user_id = auth.uid()
--     AND user_roles.role = 'admin'
--   )
-- );

