-- This file contains the final, corrected SQL statements to fix the card activation issues.
-- Please execute the entire content of this file in your Supabase SQL editor.

-- 1. Add the unique constraint to the user_routes table if it does not exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conname = 'user_routes_user_id_route_path_key'
    )
    THEN
        ALTER TABLE public.user_routes ADD CONSTRAINT user_routes_user_id_route_path_key UNIQUE (user_id, route_path);
    END IF;
END;
$$;

-- 2. Fix the foreign key constraint on the user_cards table.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conname = 'user_cards_card_id_fkey'
    )
    THEN
        ALTER TABLE public.user_cards DROP CONSTRAINT user_cards_card_id_fkey;
    END IF;
END;
$$;

ALTER TABLE public.user_cards ADD CONSTRAINT user_cards_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.enhanced_cards(id) ON DELETE CASCADE;

-- 3. Create the corrected activate_card_v2 function.
CREATE OR REPLACE FUNCTION public.activate_card_v2(
  p_card_number TEXT,
  p_player_id TEXT -- Accept text and cast to UUID
)
RETURNS TABLE (
  id UUID,
  card_number TEXT,
  duration INTEGER,
  game_type_id UUID,
  game_name TEXT,
  game_description TEXT,
  card_routes TEXT[],
  game_routes TEXT[],
  effective_routes TEXT[],
  activated BOOLEAN,
  activated_at TIMESTAMPTZ -- Return type is TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_uuid UUID;
  v_card enhanced_cards%ROWTYPE;
  v_game_type game_types%ROWTYPE;
  v_existing_activation_id UUID;
  v_effective_routes TEXT[];
BEGIN
  -- Convert player_id to UUID
  BEGIN
    v_player_uuid := p_player_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Invalid player ID format' USING ERRCODE = 'YNPF1';
  END;

  -- Check if card exists with case-insensitive comparison
  -- Explicitly use table alias for card_number
  SELECT * INTO v_card
  FROM enhanced_cards ec
  WHERE ec.card_number::TEXT = p_card_number;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card not found' USING ERRCODE = 'YNFC1';
  END IF;

  -- Validate game type exists
  IF v_card.game_type_id IS NULL THEN
    RAISE EXCEPTION 'Card has no associated game type' USING ERRCODE = 'YNGT1';
  END IF;

  -- Get game type details
  SELECT * INTO v_game_type
  FROM game_types gt
  WHERE gt.id = v_card.game_type_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game type not found' USING ERRCODE = 'YNGT2';
  END IF;

  -- Check for existing activation by another user
  SELECT cal.id INTO v_existing_activation_id
  FROM card_activation_logs cal
  WHERE cal.card_id = v_card.id
    AND cal.player_id != v_player_uuid;

  IF FOUND THEN
    RAISE EXCEPTION 'Card already linked to another user' USING ERRCODE = 'YNAU1';
  END IF;

  -- Check if already activated
  IF v_card.activated THEN
    RAISE EXCEPTION 'Card already activated' USING ERRCODE = 'YNAL1';
  END IF;

  -- Update card status with atomic operation
  UPDATE enhanced_cards ec
  SET activated = TRUE,
      activated_at = NOW() AT TIME ZONE 'UTC',
      player_id = v_player_uuid,
      used = TRUE
  WHERE ec.id = v_card.id
  RETURNING * INTO v_card;

  -- Log activation
  INSERT INTO card_activation_logs (
    card_id,
    player_id,
    game_type_id,
    activated_at
  ) VALUES (
    v_card.id,
    v_player_uuid,
    v_card.game_type_id,
    NOW()
  );

  -- Add to user cards with conflict handling
  INSERT INTO user_cards (
    user_id,
    card_id,
    linked_at
  ) VALUES (
    v_player_uuid,
    v_card.id,
    NOW()
  ) ON CONFLICT (user_id, card_id) DO NOTHING;

  -- Calculate effective routes (card-specific or game-type routes)
  -- Prioritize v_game_type.route_access if v_card.route_access contains UUIDs
  IF array_length(v_card.route_access, 1) > 0 AND octet_length(v_card.route_access[1]) = 36 THEN -- Check if first element is a UUID (length 36)
    v_effective_routes := v_game_type.route_access;
  ELSE
    v_effective_routes := COALESCE(
      NULLIF(v_card.route_access, '{}'),
      NULLIF(v_game_type.route_access, '{}'),
      '{}'::TEXT[]
    );
  END IF;

  -- Add routes if any exist (with deduplication)
  IF array_length(v_effective_routes, 1) > 0 THEN
    INSERT INTO user_routes (
      user_id,
      route_path,
      created_at
    )
    SELECT
      v_player_uuid,
      unnest(v_effective_routes),
      NOW()
    ON CONFLICT (user_id, route_path) DO NOTHING;
  END IF;

  -- Return comprehensive activation details
  RETURN QUERY
  SELECT
    v_card.id,
    v_card.card_number::TEXT,
    v_card.duration,
    v_card.game_type_id,
    v_game_type.name AS game_name,
    v_game_type.description AS game_description,
    COALESCE(v_card.route_access, '{}') AS card_routes,
    COALESCE(v_game_type.route_access, '{}') AS game_routes,
    v_effective_routes AS effective_routes,
    v_card.activated,
    v_card.activated_at::TIMESTAMPTZ; -- Cast to TIMESTAMPTZ
END;
$$;

-- 4. Grant execution permissions for the new function.
GRANT EXECUTE ON FUNCTION public.activate_card_v2(TEXT, TEXT) TO authenticated;

-- 5. Add the INSERT policy for the card_activation_logs table if it does not exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_policy
        WHERE  polname = 'Users can insert their own activation logs'
    )
    THEN
        CREATE POLICY "Users can insert their own activation logs" ON card_activation_logs
        FOR INSERT TO authenticated
        WITH CHECK (player_id = auth.uid());
    END IF;
END;
$$;