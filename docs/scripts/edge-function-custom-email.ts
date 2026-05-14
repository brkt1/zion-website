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
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap');
            body { font-family: 'Manrope', sans-serif; line-height: 1.6; color: #1C2951; margin: 0; padding: 0; background-color: #FAF9F6; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
            .header { background: #1C2951; padding: 30px; text-align: center; }
            .logo { height: 40px; }
            .content { padding: 40px; }
            h2 { font-size: 24px; margin: 0 0 24px; color: #1C2951; letter-spacing: -0.02em; }
            p { margin: 0 0 20px; color: #475569; }
            .message-body { background: #f8fafc; border-radius: 16px; padding: 32px; color: #1C2951; font-size: 15px; border: 1px solid #e2e8f0; }
            .footer { padding: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
            .social-links { margin-top: 20px; }
            .social-link { color: #1C2951; text-decoration: none; font-weight: 700; margin: 0 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://yenege.com/logo.png" alt="YENEGE" class="logo">
            </div>
            <div class="content">
              <h2>${subject}</h2>
              ${studentName ? `<p>Hello <strong>${studentName}</strong>,</p>` : '<p>Hello,</p>'}
              
              <div class="message-body">
                ${body.replace(/\n/g, '<br>')}
              </div>

              <p style="margin-top: 32px;">Best regards,<br><strong>Yenege Events Team</strong></p>
            </div>
            <div class="footer">
              <div class="social-links">
                <a href="https://t.me/yenegeevents" class="social-link">Telegram</a>
                <a href="https://instagram.com/yenegeevents" class="social-link">Instagram</a>
              </div>
              <p style="margin-top: 20px;">
                &copy; 2026 YENEGE Events & Masterclass Program<br>
                Addis Ababa, Ethiopia
              </p>
            </div>
          </div>
        </body>
        </html>
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
