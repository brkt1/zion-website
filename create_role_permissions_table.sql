-- Create the missing role_permissions table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  permission_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_name)
);

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create admin_role_permissions table
CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_role_id, permission_name)
);

-- Create user_admin_roles table
CREATE TABLE IF NOT EXISTS public.user_admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  admin_role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, admin_role_id)
);

-- Create basic indexes for the new tables only
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);

-- Insert default role permissions based on existing permissions
INSERT INTO public.role_permissions (role, permission_name) VALUES
-- SUPER_ADMIN gets all permissions
('SUPER_ADMIN', 'ADMIN'),
('SUPER_ADMIN', 'SUPER_ADMIN'),
('SUPER_ADMIN', 'can_view_dashboard'),
('SUPER_ADMIN', 'can_manage_certificates'),
('SUPER_ADMIN', 'can_create_cafe_owners'),
('SUPER_ADMIN', 'can_manage_cards'),
('SUPER_ADMIN', 'can_create_player_ids'),
('SUPER_ADMIN', 'can_create_admin_users'),
('SUPER_ADMIN', 'CAN_USE_ENHANCED_CARD'),

-- ADMIN gets most permissions (excluding SUPER_ADMIN)
('ADMIN', 'ADMIN'),
('ADMIN', 'can_view_dashboard'),a
('ADMIN', 'can_manage_certificates'),
('ADMIN', 'can_create_cafe_owners'),
('ADMIN', 'can_manage_cards'),
('ADMIN', 'can_create_player_ids'),
('ADMIN', 'can_create_admin_users'),
('ADMIN', 'CAN_USE_ENHANCED_CARD'),

-- CAFE_OWNER gets limited permissions
('CAFE_OWNER', 'can_view_dashboard'),
('CAFE_OWNER', 'CAN_USE_ENHANCED_CARD')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Enable RLS on new tables (only if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'role_permissions'
  ) THEN
    ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_roles'
  ) THEN
    ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_role_permissions'
  ) THEN
    ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_admin_roles'
  ) THEN
    ALTER TABLE public.user_admin_roles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create basic RLS policies only if they don't exist
DO $$
BEGIN
  -- role_permissions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'role_permissions' AND policyname = 'Users can view role permissions'
  ) THEN
    CREATE POLICY "Users can view role permissions" ON public.role_permissions
        FOR SELECT TO authenticated USING (true);
  END IF;

  -- admin_roles policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_roles' AND policyname = 'Users can view admin roles'
  ) THEN
    CREATE POLICY "Users can view admin roles" ON public.admin_roles
        FOR SELECT TO authenticated USING (true);
  END IF;

  -- admin_role_permissions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_role_permissions' AND policyname = 'Users can view admin role permissions'
  ) THEN
    CREATE POLICY "Users can view admin role permissions" ON public.admin_role_permissions
        FOR SELECT TO authenticated USING (true);
  END IF;

  -- user_admin_roles policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_admin_roles' AND policyname = 'Users can view their own admin roles'
  ) THEN
    CREATE POLICY "Users can view their own admin roles" ON public.user_admin_roles
        FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- Grant necessary permissions (only if not already granted)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE table_name = 'role_permissions' AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON public.role_permissions TO authenticated;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE table_name = 'admin_roles' AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON public.admin_roles TO authenticated;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE table_name = 'admin_role_permissions' AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON public.admin_role_permissions TO authenticated;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE table_name = 'user_admin_roles' AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON public.user_admin_roles TO authenticated;
  END IF;
END $$;
