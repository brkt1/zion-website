-- Enable RLS for all tables
ALTER TABLE public.game_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;

--- public.game_types ---
-- Policy for SELECT: All authenticated users can view game types
CREATE POLICY "All authenticated users can view game types"
ON public.game_types FOR SELECT
USING (auth.role() = 'authenticated'); -- Or TRUE if unauthenticated users also need to see them

-- Policy for INSERT: Only Admins and Super Admins can create game types
CREATE POLICY "Admins and Super Admins can create game types"
ON public.game_types FOR INSERT
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for UPDATE: Only Admins and Super Admins can update game types
CREATE POLICY "Admins and Super Admins can update game types"
ON public.game_types FOR UPDATE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for DELETE: Only Admins and Super Admins can delete game types
CREATE POLICY "Admins and Super Admins can delete game types"
ON public.game_types FOR DELETE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

--- public.cards ---
-- Policy for SELECT: All authenticated users can view cards (e.g., for scanning)
CREATE POLICY "All authenticated users can view cards"
ON public.cards FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy for INSERT: Only Admins and Super Admins can create cards
CREATE POLICY "Admins and Super Admins can create cards"
ON public.cards FOR INSERT
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for UPDATE: Only Admins and Super Admins can update cards
CREATE POLICY "Admins and Super Admins can update cards"
ON public.cards FOR UPDATE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for DELETE: Only Admins and Super Admins can delete cards
CREATE POLICY "Admins and Super Admins can delete cards"
ON public.cards FOR DELETE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

--- public.certificates ---
-- Policy for SELECT:
-- Players can view their own certificates (by player_id or session_id if linked to auth.uid)
-- Admins and Super Admins can view all certificates.
-- Cafe owners can view certificates they are associated with (e.g., if they issued it, or if there's a cafe_id on the certificate).
-- For simplicity, assuming 'player_id' is linked to auth.uid() for players, and admins see all.
CREATE POLICY "Users can view their own certificates, Admins and Super Admins can view all"
ON public.certificates FOR SELECT
USING (
    auth.uid() = (SELECT id FROM public.profiles WHERE player_id = certificates.player_id) -- Assuming player_id is linked to profile.id
    OR
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
    -- Add condition for CAFE_OWNER if they need to see specific certificates
    -- OR public.get_user_role(auth.uid()) = 'CAFE_OWNER' AND certificates.issued_by_cafe_id = (SELECT cafe_id FROM public.cafe_owners WHERE id = auth.uid())
);

-- Policy for INSERT:
-- Only Cafe Owners (when rewarding) or Admins/Super Admins can create certificates.
CREATE POLICY "Cafe Owners and Admins can create certificates"
ON public.certificates FOR INSERT
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('CAFE_OWNER', 'ADMIN', 'SUPER_ADMIN')
);

-- Policy for UPDATE:
-- Admins/Super Admins can update any certificate.
-- Cafe Owners can update 'prize_delivered' status for certificates they are allowed to manage.
CREATE POLICY "Admins and Super Admins can update certificates"
ON public.certificates FOR UPDATE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for DELETE: Only Admins and Super Admins can delete certificates
CREATE POLICY "Admins and Super Admins can delete certificates"
ON public.certificates FOR DELETE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

--- public.profiles ---
-- Policy for SELECT: Users can view their own profile, Admins and Super Admins can view all profiles
CREATE POLICY "Users can view their own profile, Admins and Super Admins can view all"
ON public.profiles FOR SELECT
USING (
    auth.uid() = id
    OR
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for INSERT:
-- New profiles are typically created via auth.users.
-- Only Admins and Super Admins can insert new profiles (e.g., for new admin/cafe_owner accounts).
CREATE POLICY "Admins and Super Admins can create profiles"
ON public.profiles FOR INSERT
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for UPDATE: Users can update their own profile, Admins and Super Admins can update any profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins and Super Admins can update any profile"
ON public.profiles FOR UPDATE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for DELETE: Only Admins and Super Admins can delete profiles
CREATE POLICY "Admins and Super Admins can delete profiles"
ON public.profiles FOR DELETE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

--- public.user_cards ---
-- Policy for SELECT: Users can view their own user_cards, Admins and Super Admins can view all
CREATE POLICY "Users can view their own user cards, Admins and Super Admins can view all"
ON public.user_cards FOR SELECT
USING (
    auth.uid() = user_id
    OR
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for INSERT: Users can insert their own user_cards (e.g., when scanning a card)
CREATE POLICY "Users can add their own user cards"
ON public.user_cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Only Admins and Super Admins can update user_cards
CREATE POLICY "Admins and Super Admins can update user cards"
ON public.user_cards FOR UPDATE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for DELETE: Only Admins and Super Admins can delete user_cards
CREATE POLICY "Admins and Super Admins can delete user cards"
ON public.user_cards FOR DELETE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

--- public.cafe_owners ---
-- Policy for SELECT: Cafe owners can view their own data, Admins and Super Admins can view all
CREATE POLICY "Cafe owners can view their own data, Admins and Super Admins can view all"
ON public.cafe_owners FOR SELECT
USING (
    auth.uid() = id -- Assuming 'id' in cafe_owners is linked to auth.uid()
    OR
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for INSERT: Only Admins and Super Admins can create new cafe owner entries
CREATE POLICY "Admins and Super Admins can create cafe owners"
ON public.cafe_owners FOR INSERT
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for UPDATE: Cafe owners can update their own profile, Admins and Super Admins can update any
CREATE POLICY "Cafe owners can update their own profile"
ON public.cafe_owners FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins and Super Admins can update any cafe owner"
ON public.cafe_owners FOR UPDATE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for DELETE: Only Admins and Super Admins can delete cafe owner entries
CREATE POLICY "Admins and Super Admins can delete cafe owners"
ON public.cafe_owners FOR DELETE
USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

--- public.admin_activity_log ---
-- Policy for SELECT: Only Super Admins can view the activity log
CREATE POLICY "Super Admins can view activity log"
ON public.admin_activity_log FOR SELECT
USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

-- Policy for INSERT: Only the service role (backend) can insert into activity log
-- This assumes your backend is inserting these logs using a service role key.
CREATE POLICY "Service role can insert activity log"
ON public.admin_activity_log FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policies for UPDATE and DELETE: No direct user access
-- (Implicitly denied if no policies are created)

--- public.permission_requests ---
-- Policy for SELECT:
-- Admins can view their own permission requests.
-- Super Admins can view all permission requests.
CREATE POLICY "Admins can view their own permission requests, Super Admins can view all"
ON public.permission_requests FOR SELECT
USING (
    auth.uid() = requester_admin_id
    OR
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

-- Policy for INSERT: Only Admins can create permission requests
CREATE POLICY "Admins can create permission requests"
ON public.permission_requests FOR INSERT
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);

-- Policy for UPDATE: Only Super Admins can update permission requests (e.g., status)
CREATE POLICY "Super Admins can update permission requests"
ON public.permission_requests FOR UPDATE
USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

-- Policy for DELETE: Only Super Admins can delete permission requests
CREATE POLICY "Super Admins can delete permission requests"
ON public.permission_requests FOR DELETE
USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

--- public.permissions ---
-- Policy for SELECT: All authenticated users can view available permissions
CREATE POLICY "All authenticated users can view permissions"
ON public.permissions FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy for INSERT: Only Super Admins can create new permissions
CREATE POLICY "Super Admins can create permissions"
ON public.permissions FOR INSERT
WITH CHECK (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

-- Policy for UPDATE: Only Super Admins can update permissions
CREATE POLICY "Super Admins can update permissions"
ON public.permissions FOR UPDATE
USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

-- Policy for DELETE: Only Super Admins can delete permissions
CREATE POLICY "Super Admins can delete permissions"
ON public.permissions FOR DELETE
USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

--- public.profile_permissions ---
-- Policy for SELECT: Only Super Admins can view profile-permission assignments
CREATE POLICY "Super Admins can view profile permissions"
ON public.profile_permissions FOR SELECT
USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

-- Policy for INSERT: Only Super Admins can assign permissions to profiles
CREATE POLICY "Super Admins can assign permissions to profiles"
ON public.profile_permissions FOR INSERT
WITH CHECK (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

-- Policy for UPDATE: Only Super Admins can update profile-permission assignments
CREATE POLICY "Super Admins can update profile permissions"
ON public.profile_permissions FOR UPDATE
USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);

-- Policy for DELETE: Only Super Admins can revoke permissions from profiles
CREATE POLICY "Super Admins can revoke profile permissions"
ON public.profile_permissions FOR DELETE
USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
);