import { createClient } from "https://esm.sh/@supabase/supabase-js@2.3.0";    
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  // Only allow GET requests to this endpoint
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const token = authHeader.split(" ")[1];

    // Create a Supabase client with the admin key
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the JWT token
    const { data: userData, error: authError } = await supabase.auth.getUser(
      token
    );
    if (authError || !userData) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Get user permissions from the database
    // Assuming you have a user_permissions table or a way to determine permissions
    const { data: permissions, error: permissionsError } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    // If the table doesn't exist yet or no permissions are found, return default permissions
    if (permissionsError) {
      // You might want to check if the error is because the table doesn't exist
      // and return a default set of permissions
      return new Response(
        JSON.stringify({
          permissions: {
            canRead: true,
            canWrite: false,
            canDelete: false,
            canAdmin: false,
          },
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(JSON.stringify({ permissions }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
