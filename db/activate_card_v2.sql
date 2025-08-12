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
  activated_at TIMESTAMPTZ -- Changed to TIMESTAMPTZ
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
      activated_at = NOW() AT TIME ZONE 'UTC', -- No need for AT TIME ZONE 'UTC' when column is TIMESTAMPTZ
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
  v_effective_routes := COALESCE(
    NULLIF(v_card.route_access, '{}'),
    NULLIF(v_game_type.route_access, '{}'),
    '{}'::TEXT[]
  );

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
    v_card.activated_at;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.activate_card_v2(TEXT, TEXT) TO authenticated;
