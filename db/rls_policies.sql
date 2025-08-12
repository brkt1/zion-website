CREATE POLICY "Users can insert their own activation logs" ON card_activation_logs
FOR INSERT TO authenticated
WITH CHECK (player_id = auth.uid());
