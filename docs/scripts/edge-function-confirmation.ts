import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "https://esm.sh/nodemailer@6.9.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { record, type } = await req.json();

    if (type !== 'INSERT') {
      return new Response(JSON.stringify({ message: "Only INSERT events are handled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { name, email, phone } = record;

    if (!email) {
      return new Response(JSON.stringify({ error: "No email provided in record" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Configure Nodemailer with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'yenegeevents@gmail.com',
        // In a real scenario, use an App Password stored in Supabase Secrets
        pass: Deno.env.get('GMAIL_APP_PASSWORD'),
      },
    });

    const mailOptions = {
      from: '"Yenege Events" <yenegeevents@gmail.com>',
      to: email,
      subject: 'Masterclass Reservation Received - Yenege Events',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #FFD447;">We have received your form!</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering for our Masterclass. This email confirms that we have successfully received your reservation details.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Next Steps:</strong></p>
            <p>Our team will review your application and contact you shortly with more details.</p>
          </div>

          <p>If you have any urgent questions, feel free to contact us:</p>
          <p style="font-size: 18px; font-weight: bold; color: #1C2951;">📞 +251 911 234 567</p>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p><strong>Join our community:</strong></p>
          <div style="display: flex; gap: 10px;">
            <a href="https://t.me/yenegeevents" style="background-color: #0088cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Telegram Community</a>
            <a href="https://instagram.com/yenegeevents" style="background-color: #e4405f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">Instagram</a>
          </div>

          <p style="font-size: 12px; color: #888; margin-top: 30px;">
            Yenege Events & Masterclass Program<br>
            Addis Ababa, Ethiopia
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
