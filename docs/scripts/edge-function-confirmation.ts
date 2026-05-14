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
      console.log("No email provided, skipping confirmation email.");
      return new Response(JSON.stringify({ success: true, message: "No email provided, skipping." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
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
            .container { max-width: 700px; margin: 20px auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.08); }
            .header { background: #1C2951; padding: 50px 40px; text-align: center; }
            .logo { height: 70px; margin-bottom: 24px; }
            .content { padding: 50px 40px; }
            .badge { display: inline-block; padding: 8px 16px; background: #FFD447; color: #1C2951; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 24px; }
            h1 { font-size: 32px; margin: 0 0 16px; color: #1C2951; letter-spacing: -0.03em; }
            .intro { font-size: 16px; color: #64748b; margin-bottom: 40px; border-left: 4px solid #FFD447; padding-left: 20px; }
            
            .tier-card { border-radius: 24px; padding: 32px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            .tier-basic { background: #f8fafc; }
            .tier-intermediate { background: #fffcf0; border-color: #FFD447; }
            .tier-premium { background: #1C2951; color: #ffffff; }
            
            .tier-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; display: block; }
            .tier-name { font-size: 24px; font-weight: 800; margin: 0 0 16px; }
            .tier-desc { font-size: 14px; margin-bottom: 24px; opacity: 0.8; }
            .feature-list { list-style: none; padding: 0; margin: 0; font-size: 13px; }
            .feature-list li { margin-bottom: 12px; padding-left: 24px; position: relative; }
            .feature-list li::before { content: '✓'; position: absolute; left: 0; color: #FFD447; font-weight: bold; }
            
            .price-tag { font-size: 12px; font-weight: 800; color: #FFD447; text-transform: uppercase; margin-top: 24px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 16px; display: block; }
            .tier-premium .price-tag { border-color: rgba(255,255,255,0.1); }
            
            .contact-section { background: #1C2951; color: white; padding: 40px; border-radius: 24px; text-align: center; margin-top: 40px; }
            .btn { display: inline-block; background: #FFD447; color: #1C2951; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 20px; }
            
            .footer { padding: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
            .amharic { font-family: sans-serif; direction: ltr; margin-top: 10px; display: block; opacity: 0.9; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://yenege.com/logo.png" alt="YENEGE" class="logo">
              <div style="color: #FFD447; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px;">Event Organizing Course</div>
            </div>
            
            <div class="content">
              <span class="badge">Application Received</span>
              <h1>Hello ${name}, your journey begins here!</h1>
              <div class="intro">
                Choose the perfect path to master event organizing with Yenege. Build your skills, get certified, and connect with industry professionals to elevate your career.
                <span class="amharic">የኢቨንት አዘጋጅነት ክህሎትዎን ከየነገ ጋር ያሳድጉ። ክህሎትዎን ያዳብሩ፣ ዓለም አቀፍ ሰርተፍኬት ያግኙ፣ እንዲሁም ከዘርፉ ባለሙያዎች ጋር በመገናኘት የስራ እድልዎን ያሰፉ።</span>
              </div>

              <!-- Basic Tier -->
              <div class="tier-card tier-basic">
                <span class="tier-label">Tier 01</span>
                <h2 class="tier-name">Basic / ቤዚክ</h2>
                <p class="tier-desc">The Foundation: The perfect starting point for those new to the industry.<br><span class="amharic">የመሠረት መጣያ፦ ወደ ኢቨንት ዝግጅት ዓለም ለመግባት ለሚፈልጉ ጀማሪዎች።</span></p>
                <ul class="feature-list">
                  <li>Full Access: Study all 9 core modules.<br><span class="amharic">ሙሉ ስልጠና፦ ሁሉንም 9 የትምህርት ሞጁሎች በጥልቀት ይማሩ።</span></li>
                  <li>Certification: Earn an International Certificate.<br><span class="amharic">ዓለም አቀፍ ሰርተፍኬት፦ የሙያ ማረጋገጫ ምስክር ወረቀት።</span></li>
                  <li>Networking: Join our private work community.<br><span class="amharic">የባለሙያዎች ማህበረሰብ፦ የየነገ የቴሌግራም ግሩፕ አባልነት።</span></li>
                </ul>
                <span class="price-tag">Contact us for pricing & scholarships</span>
              </div>

              <!-- Intermediate Tier -->
              <div class="tier-card tier-intermediate">
                <span class="tier-label">Tier 02 - Most Popular</span>
                <h2 class="tier-name">Intermediate / ኢንተርሚዲየት</h2>
                <p class="tier-desc">The Professional: For those ready to start working and earning money as a planner.<br><span class="amharic">ለባለሙያዎች፦ በሙያው ተቀጥረው መስራት እና ገቢ ማግኘት ለሚፈልጉ።</span></p>
                <ul class="feature-list">
                  <li><strong>Includes Everything in Basic</strong></li>
                  <li>Toolkit: Professional templates (contracts, budgets).<br><span class="amharic">የስራ መርጃ መሣሪያዎች፦ የውል ስምምነት፣ የባጀት እና የፕላኒንግ ቅጾች።</span></li>
                  <li>Practical Mastery: Negotiating with vendors and ROI.<br><span class="amharic">ተግባራዊ ክህሎት፦ ከአቅራቢዎች ጋር የመደራደር ጥበብ እና ትርፋማነትን የማረጋገጥ ስልጠና።</span></li>
                  <li>Job Placement: Free registration on Yenege Job Platform.<br><span class="amharic">የስራ ዕድል፦ በየነገ የስራ ማስታወቂያ ፕላትፎርም ላይ ቅድሚያ የመመዝገብ ዕድል።</span></li>
                </ul>
                <span class="price-tag">Contact us for pricing & scholarships</span>
              </div>

              <!-- Premium Tier -->
              <div class="tier-card tier-premium">
                <span class="tier-label">Tier 03 - Executive</span>
                <h2 class="tier-name">Premium / ፕሪሚየም</h2>
                <p class="tier-desc">The Visionary: For entrepreneurs ready to launch their own event brand legally.<br><span class="amharic">ለስራ ፈጣሪዎች፦ የራስዎን ትልቅ ዝግጅት በህጋዊ መንገድ መጀመር ለሚፈልጉ።</span></p>
                <ul class="feature-list">
                  <li><strong>Includes Basic & Intermediate</strong></li>
                  <li>Legal Launch: Use the Official Yenege License legally.<br><span class="amharic">ህጋዊ የንግድ ፍቃድ፦ የየነገን ህጋዊ የንግድ ፍቃድ የመጠቀም መብት።</span></li>
                  <li>Business Incubation: Build your full plan from scratch.<br><span class="amharic">ሃሳብን ወደ ስራ መለወጥ፦ የራስዎን የኢቨንት ሃሳብ እውን እንዲሆን እናግዝዎታለን።</span></li>
                  <li>Co-Hosting: Organize your first major event with our team.<br><span class="amharic">የጋራ ዝግጅት፦ የመጀመሪያውን ትልቅ ዝግጅት ከየነገ ባለሙያዎች ጋር በጋራ የማከናወን ዕድል።</span></li>
                </ul>
                <span class="price-tag">Contact us for pricing & scholarships</span>
              </div>

              <div class="contact-section">
                <h3 style="margin:0">Wait for our call!</h3>
                <p style="font-size: 14px; opacity: 0.9; margin-top: 10px;">Our team will call you within 24 hours to discuss the schedule, pricing, and available discounts.</p>
                <a href="tel:+251911234567" class="btn">Call Admin Now</a>
              </div>
            </div>

            <div class="footer">
              &copy; 2026 YENEGE Events & Masterclass Program<br>
              Addis Ababa, Ethiopia • <a href="https://yenege.com" style="color: #94a3b8;">yenege.com</a>
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
