import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "https://esm.sh/nodemailer@6.9.1";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
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
        pass: 'oiok nbsq kstn bsvj', // Gmail App Password
      },
    });

    const mailOptions = {
      from: '"Yenege Masterclass" <yenegeevents@gmail.com>',
      to: email,
      subject: 'Reservation Confirmed - Yenege Masterclass Program',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap');
            body { font-family: 'Manrope', sans-serif; line-height: 1.6; color: #1C2951; margin: 0; padding: 0; background-color: #FAF9F6; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
            .header { background: #1C2951; padding: 40px; text-align: center; }
            .logo { height: 60px; margin-bottom: 20px; }
            .content { padding: 40px; }
            .badge { display: inline-block; padding: 6px 12px; background: #FFD447; color: #1C2951; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
            h1 { font-size: 28px; margin: 0 0 16px; color: #1C2951; letter-spacing: -0.02em; }
            p { margin: 0 0 24px; color: #64748b; }
            .highlight-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
            .contact-btn { display: block; width: 100%; text-align: center; background: #1C2951; color: #ffffff !important; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
            .social-links { display: flex; justify-content: center; gap: 12px; margin-top: 32px; padding-top: 32px; border-top: 1px solid #f1f5f9; }
            .social-btn { padding: 10px 20px; border-radius: 100px; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-block; }
            .tg { background: #0088cc; color: white !important; }
            .ig { background: #e4405f; color: white !important; }
            .footer { padding: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <!-- Update with your actual hosted logo URL -->
              <img src="https://yenege.com/logo.png" alt="YENEGE" class="logo">
            </div>
            <div class="content">
              <span class="badge">Masterclass Reserved</span>
              <h1>We have received your form!</h1>
              <p>Hello <strong>${name}</strong>,</p>
              <p>Thank you for registering for the <strong>E-Learning Program Masterclass</strong>. This email confirms that your reservation details have been successfully recorded in our system.</p>
              
              <div class="highlight-box">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">Next Steps</div>
                <div style="font-size: 15px; color: #1C2951; font-weight: 600;">Our team is currently reviewing your profile. We will contact you via phone or Telegram within 24-48 hours with more details about the curriculum and onboarding.</div>
              </div>

              <p>If you have any urgent questions, reach out directly:</p>
              <a href="tel:+251911234567" class="contact-btn">Call Admin: +251 911 234 567</a>

              <div class="social-links">
                <a href="https://t.me/yenegeevents" class="social-btn tg">Telegram Community</a>
                <a href="https://instagram.com/yenegeevents" class="social-btn ig">Instagram</a>
              </div>
            </div>
            <div class="footer">
              &copy; 2026 YENEGE Events & Masterclass Program<br>
              Addis Ababa, Ethiopia • Professional Event Architecture
            </div>
          </div>
        </body>
        </html>
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
