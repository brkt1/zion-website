import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Only expect cardId (the card number)
    const { cardId } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers,
      });
    }

    // Call scan_and_activate_card with only p_card_number
    const { data, error } = await supabase.rpc("scan_and_activate_card", {
      p_card_number: cardId.toString(),
    });

    if (error) throw error;

    return new Response(JSON.stringify(data), { headers });
  } catch (error) {
    console.error("Error processing card scan:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process card scan",
        details: error.message || error,
      }),
      { status: 500, headers }
    );
  }
});
