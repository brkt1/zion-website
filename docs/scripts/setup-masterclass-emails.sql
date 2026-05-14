-- 1. Add email column to masterclass_reservations
ALTER TABLE masterclass_reservations 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Create the trigger function to call the Edge Function
CREATE OR REPLACE FUNCTION public.on_masterclass_reservation_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function
  -- Replace 'YOUR_PROJECT_REF' and 'YOUR_ANON_KEY' with actual values
  -- OR rely on Supabase's net.http_post if configured
  -- For now, we assume the user will deploy the Edge Function named 'send-masterclass-confirmation'
  
  PERFORM
    net.http_post(
      url := 'https://' || current_setting('request.headers')::json->>'host' || '/functions/v1/send-masterclass-confirmation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.headers')::json->>'apikey'
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'type', 'INSERT'
      )
    );
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS tr_masterclass_reservation_insert ON masterclass_reservations;
CREATE TRIGGER tr_masterclass_reservation_insert
AFTER INSERT ON masterclass_reservations
FOR EACH ROW
EXECUTE FUNCTION public.on_masterclass_reservation_insert();

-- Note: The 'net' extension must be enabled in Supabase for http_post to work.
-- If not enabled, run: CREATE EXTENSION IF NOT EXISTS "net" WITH SCHEMA "extensions";
