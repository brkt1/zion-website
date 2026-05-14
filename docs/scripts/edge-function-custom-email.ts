import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { to, subject, body, studentName } = await req.json();

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject, or body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Configure Nodemailer with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'yenegeevents@gmail.com',
        pass: Deno.env.get('GMAIL_APP_PASSWORD'),
      },
    });

    const recipients = Array.isArray(to) ? to.join(', ') : to;

    const mailOptions = {
      from: '"Yenege Events Admin" <yenegeevents@gmail.com>',
      to: recipients,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1C2951;">${subject}</h2>
          ${studentName ? `<p>Hello <strong>${studentName}</strong>,</p>` : '<p>Hello,</p>'}
          
          <div style="margin: 20px 0; line-height: 1.6; color: #333;">
            ${body.replace(/\n/g, '<br>')}
          </div>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p>Best regards,<br><strong>Yenege Events Team</strong></p>
          
          <div style="margin-top: 20px;">
            <a href="https://t.me/yenegeevents" style="color: #0088cc; text-decoration: none; margin-right: 15px;">Telegram</a>
            <a href="https://instagram.com/yenegeevents" style="color: #e4405f; text-decoration: none;">Instagram</a>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
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
