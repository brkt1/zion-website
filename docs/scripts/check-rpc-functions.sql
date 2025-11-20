-- Diagnostic script to check if RPC functions exist
-- Run this in Supabase SQL Editor to verify the functions are created

-- Check if assign_event_organizer_role function exists
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('assign_event_organizer_role', 'assign_organizer_to_event')
ORDER BY p.proname;

-- Check permissions
SELECT 
  p.proname as function_name,
  r.rolname as role_name,
  has_function_privilege(r.rolname, p.oid, 'EXECUTE') as can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
  AND p.proname IN ('assign_event_organizer_role', 'assign_organizer_to_event')
  AND r.rolname = 'authenticated'
ORDER BY p.proname;

