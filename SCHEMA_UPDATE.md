# Database Schema Update Instructions

## Issue Fixed
The API was failing when tables were empty because `.single()` throws an error when no rows are found. This has been fixed in the API code.

## Schema Updates Needed

If you haven't run the schema yet, run `supabase-schema.sql` in your Supabase SQL Editor.

If you've already run it, you may need to add the `icon` column to the `social_links` table:

```sql
-- Add icon column to social_links if it doesn't exist
ALTER TABLE social_links 
ADD COLUMN IF NOT EXISTS icon TEXT;
```

## Ensure Data Exists

Make sure you have at least one row in the `contact_info` table. If the table is empty, you can insert data using:

```sql
INSERT INTO contact_info (email, phone, phone_formatted, location) 
VALUES ('bereketyosef49@gmail.com', '+251978639887', '+251 978 639 887', 'Addis Ababa, Ethiopia')
ON CONFLICT DO NOTHING;
```

## Testing

After updating:
1. Restart your React app
2. Check the browser console for any errors
3. The contact information should now load correctly
4. If tables are empty, the API will return empty/default values instead of throwing errors

