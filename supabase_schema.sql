-- Enable the uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the 'game_types' table
CREATE TABLE public.game_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the 'cards' table
CREATE TABLE public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    duration INTEGER NOT NULL,
    game_type_id UUID REFERENCES public.game_types(id),
    card_number TEXT UNIQUE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the 'certificates' table
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name TEXT NOT NULL,
    player_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    has_won_coffee BOOLEAN DEFAULT FALSE,
    has_won_prize BOOLEAN DEFAULT FALSE,
    reward_type TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    session_id TEXT NOT NULL,
    prize_delivered BOOLEAN DEFAULT FALSE,
    prize_amount REAL,
    created_at TIMESTAMPTZ DEFAULT now(),
    game_type_id UUID REFERENCES public.game_types(id)
);

-- Create the 'profiles' table
-- This table is typically linked to auth.users via a trigger or RLS policies.
-- The 'id' column here should match the 'id' from auth.users.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT NOT NULL DEFAULT 'USER', -- e.g., 'USER', 'ADMIN', 'CAFE_OWNER'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the 'user_cards' table
CREATE TABLE public.user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Assuming user_id links to Supabase auth.users
    card_id UUID REFERENCES public.cards(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- New: Create the 'admin_activity_log' table
CREATE TABLE public.admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.profiles(id) NOT NULL,
    action TEXT NOT NULL, -- e.g., 'DELETED_CARD', 'CREATED_CAFE_OWNER', 'UPDATED_USER_ROLE', 'LOGIN'
    target_id UUID, -- ID of the item affected by the action (e.g., card ID, user ID)
    details JSONB, -- Additional context (e.g., old value, new value)
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- New: Create the 'permission_requests' table
CREATE TABLE public.permission_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_admin_id UUID REFERENCES public.profiles(id) NOT NULL,
    action_type TEXT NOT NULL, -- e.g., 'DELETE_CARD', 'DELETE_USER', 'CHANGE_ROLE'
    target_table TEXT NOT NULL, -- e.g., 'cards', 'profiles', 'game_types'
    target_id UUID NOT NULL, -- ID of the item to be deleted/modified
    request_details JSONB, -- Additional details about the request
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    requested_at TIMESTAMPTZ DEFAULT now(),
    responded_by_super_admin_id UUID REFERENCES public.profiles(id),
    responded_at TIMESTAMPTZ,
    response_reason TEXT
);

-- New: Create the 'permissions' table for granular permissions
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- e.g., 'can_generate_cards', 'can_create_cafe_owners'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- New: Create the 'profile_permissions' junction table
CREATE TABLE public.profile_permissions (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, permission_id),
    assigned_at TIMESTAMPTZ DEFAULT now()
);

-- Important Notes:
-- 1. 'auth.users' table: This table is automatically managed by Supabase Authentication. You do not need to create it manually. The 'profiles' and 'user_cards' tables reference 'auth.users.id'.
-- 2. 'uuid_generate_v4()': Ensure that the 'uuid-ossp' extension is enabled in your Supabase project for 'uuid_generate_v4()' to work. You can enable it in the Supabase dashboard under "Database" -> "Extensions".
-- 3. Row Level Security (RLS): For a production application, it is HIGHLY RECOMMENDED to implement Row Level Security (RLS) policies on your Supabase tables to control data access based on user roles and ownership. The provided SQL does not include RLS policies, but you should add them for security.
--    Example for 'profiles' table:
--    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
--    CREATE POLICY "Users can view their own profile." ON public.profiles
--      FOR SELECT USING (auth.uid() = id);
--    CREATE POLICY "Users can update their own profile." ON public.profiles
--      FOR UPDATE USING (auth.uid() = id);
