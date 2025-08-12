CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  DECLARE
    user_role text := 'USER'; -- Default role
  BEGIN
    SELECT p.name
    INTO user_role
    FROM public.profile_permissions pp
    JOIN public.permissions p ON pp.permission_id = p.id
    WHERE pp.profile_id = user_id
    ORDER BY
      CASE p.name
        WHEN 'SUPER_ADMIN' THEN 1
        WHEN 'ADMIN' THEN 2
        WHEN 'CAFE_OWNER' THEN 3
        WHEN 'USER' THEN 4
        ELSE 5 -- Lower priority for other permissions
      END
    LIMIT 1;

    RETURN user_role;
  END;
$function$;