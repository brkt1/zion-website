CREATE OR REPLACE VIEW public.enhanced_cards_with_profile AS
SELECT
    ec.id,
    ec.card_number,
    ec.duration,
    ec.game_type_id,
    ec.route_access,
    ec.used,
    ec.created_at,
    ec.player_id,
    ec.created_by,
    p.full_name AS player_name,
    p.player_position,
    p.player_team,
    p.card_rarity,
    gt.name AS game_type
FROM
    public.enhanced_cards ec
LEFT JOIN
    public.profiles p ON ec.player_id = p.id
LEFT JOIN
    public.game_types gt ON ec.game_type_id = gt.id;