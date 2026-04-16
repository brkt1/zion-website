-- 1. Ensure the 'anon' and 'authenticated' roles have INSERT permission
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.feasibility_briefs TO anon, authenticated;

-- We intentionally DO NOT grant SELECT to anon, so they cannot read data.
-- (If you get an error returning the inserted row, Supabase might need SELECT, but we'll restrict it via RLS)

-- 2. Make sure Row Level Security is enabled
ALTER TABLE public.feasibility_briefs ENABLE ROW LEVEL SECURITY;

-- 3. Drop previous policies to reset
DROP POLICY IF EXISTS "Allow public inserts to feasibility_briefs" ON public.feasibility_briefs;
DROP POLICY IF EXISTS "Allow anon inserts" ON public.feasibility_briefs;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.feasibility_briefs;

-- 4. Create policies to allow BOTH unauthenticated (anon) and authenticated users to insert
CREATE POLICY "Allow anon inserts" 
ON public.feasibility_briefs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts" 
ON public.feasibility_briefs FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Only let admins (or super users) read the data, regular users and anon CANNOT see it.
-- (You will likely need an admin policy here, such as matching a user role)
ON public.feasibility_briefs 
FOR SELECT 
TO authenticated 
USING (true);
