
-- Function to scan and activate a card
CREATE OR REPLACE FUNCTION scan_and_activate_card(
    p_card_number text
)
RETURNS TABLE (
    status boolean,
    message text,
    card_id uuid,
    game_type_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_user_id uuid;
    v_card_record RECORD;
BEGIN
    -- Get the current authenticated user
    v_current_user_id := auth.uid();

    -- Check if the user is authenticated
    IF v_current_user_id IS NULL THEN
        RETURN QUERY 
        SELECT 
            false, 
            'User not authenticated', 
            NULL::uuid, 
            NULL::text;
        RETURN;
    END IF;

    -- Find the card and check its status
    SELECT 
        ec.id, 
        ec.used, 
        ec.player_id, 
        ec.created_at, 
        gt.name AS game_type_name,
        ec.duration
    INTO v_card_record
    FROM enhanced_cards ec
    JOIN game_types gt ON ec.game_type_id = gt.id
    WHERE ec.card_number = p_card_number;

    -- If card not found
    IF v_card_record.id IS NULL THEN
        RETURN QUERY 
        SELECT 
            false, 
            'Card not found', 
            NULL::uuid, 
            NULL::text;
        RETURN;
    END IF;

    -- Check if card is already used
    IF v_card_record.used THEN
        RETURN QUERY 
        SELECT 
            false, 
            'Card already used', 
            v_card_record.id, 
            v_card_record.game_type_name;
        RETURN;
    END IF;

    -- Check if card is already assigned to another player
    IF v_card_record.player_id IS NOT NULL AND v_card_record.player_id != v_current_user_id THEN
        RETURN QUERY 
        SELECT 
            false, 
            'Card already assigned to another player', 
            v_card_record.id, 
            v_card_record.game_type_name;
        RETURN;
    END IF;

    -- Update the card with the current user and mark as used
    UPDATE enhanced_cards
    SET 
        player_id = v_current_user_id,
        used = true
    WHERE id = v_card_record.id;

    -- Return success
    RETURN QUERY 
    SELECT 
        true, 
        'Card successfully activated', 
        v_card_record.id, 
        v_card_record.game_type_name;
END;
$$;

-- Create a trigger function to log card activations
CREATE OR REPLACE FUNCTION log_card_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert a log entry when a card is activated
    INSERT INTO card_activation_logs (
        card_id,
        player_id,
        activated_at,
        game_type_id
    ) VALUES (
        NEW.id,
        NEW.player_id,
        NOW(),
        NEW.game_type_id
    );
    
    RETURN NEW;
END;
$$;

-- Create a table to log card activations
CREATE TABLE card_activation_logs (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    card_id uuid NOT NULL REFERENCES enhanced_cards(id),
    player_id uuid NOT NULL REFERENCES auth.users(id),
    activated_at timestamp with time zone NOT NULL DEFAULT NOW(),
    game_type_id uuid NOT NULL REFERENCES game_types(id)
);

-- Create the trigger
CREATE TRIGGER card_activation_trigger
AFTER UPDATE OF player_id, used ON enhanced_cards
FOR EACH ROW
WHEN (NEW.player_id IS NOT NULL AND NEW.used = true)
EXECUTE FUNCTION log_card_activation();

-- Create a view to easily check card status
CREATE OR REPLACE VIEW active_cards_view AS
SELECT 
    ec.id,
    ec.card_number,
    ec.duration,
    gt.name AS game_type_name,
    ec.route_access,
    ec.used,
    ec.player_id,
    ec.created_at,
    cal.activated_at
FROM enhanced_cards ec
JOIN game_types gt ON ec.game_type_id = gt.id
LEFT JOIN card_activation_logs cal ON cal.card_id = ec.id
WHERE ec.used = true;

-- RLS Policy for card activation logs
ALTER TABLE card_activation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activation logs" ON card_activation_logs
FOR SELECT TO authenticated
USING (player_id = auth.uid());

CREATE POLICY "Admins can view all activation logs" ON card_activation_logs
FOR SELECT TO service_role
USING (true);

-- Usage:
-- SELECT * FROM scan_and_activate_card('1234567890123');
