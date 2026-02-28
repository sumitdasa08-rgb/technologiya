import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@technologiya.local";

// Debug: log key format (not the full key)
console.log("BREVO_API_KEY configured:", BREVO_API_KEY ? `yes (${BREVO_API_KEY.substring(0, 10)}...)` : "no");
console.log("SENDER_EMAIL:", SENDER_EMAIL);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Send email via Brevo API
async function sendEmail(to: string, toName: string, subject: string, html: string) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "TechnoLogiya",
        email: SENDER_EMAIL
      },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo API error: ${error}`);
  }

  return await response.json();
}

// Email templates for each status
const getStatusEmailContent = (
  customerName: string,
  shortRef: string,
  eventType: "payment_confirmed" | "status_update",
  repairStatus?: string,
  amount?: number
) => {
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px; margin: 0 auto; padding: 20px;
    background-color: #f8f9fa; border-radius: 12px;
  `;

  const headerStyles = `
    color: #1a1a1a; font-size: 24px; margin-bottom: 16px;
  `;

  const trackingUrl = "https://technologiya.lovable.app/track";

  if (eventType === "payment_confirmed") {
    return {
      subject: `✅ Payment Confirmed - Booking #${shortRef}`,
      html: `
        <div style="${baseStyles}">
          <h1 style="${headerStyles}">🎉 Payment Confirmed!</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi <strong>${customerName}</strong>,</p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your payment of <strong style="color: #16a34a;">₹${amount}</strong> for booking 
            <strong>#${shortRef}</strong> has been received and confirmed.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Our technician will contact you shortly to begin the repair process.
          </p>
          <div style="margin: 24px 0; padding: 16px; background: #e8f5e9; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 12px 0; color: #1b5e20;">Track your repair status anytime:</p>
            <a href="${trackingUrl}" style="display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Track Your Repair
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Thank you for choosing TechnoLogiya! 🙏</p>
        </div>
      `,
    };
  }

  // Repair status updates
  const statusMessages: Record<string, { title: string; description: string; emoji: string; color: string }> = {
    pending: {
      title: "Booking Received",
      description: "Your booking has been received. We'll assign a technician soon.",
      emoji: "📋",
      color: "#6b7280",
    },
    technician_called: {
      title: "Technician Assigned",
      description: "A technician has been assigned to your repair and will contact you shortly.",
      emoji: "📞",
      color: "#3b82f6",
    },
    technician_fixing: {
      title: "Repair In Progress",
      description: "Our technician is currently working on fixing your device. We'll update you when it's done.",
      emoji: "🔧",
      color: "#f59e0b",
    },
    fixed: {
      title: "Device Fixed!",
      description: "Great news! Your device has been fixed and is ready for final verification.",
      emoji: "✅",
      color: "#10b981",
    },
    customer_satisfied: {
      title: "Repair Completed",
      description: "Your repair has been completed successfully. We hope you're satisfied with our service!",
      emoji: "🎉",
      color: "#8b5cf6",
    },
  };

  const status = statusMessages[repairStatus || ""] || {
    title: "Status Update",
    description: "Your repair status has been updated.",
    emoji: "📋",
    color: "#6b7280",
  };

  return {
    subject: `${status.emoji} ${status.title} - Booking #${shortRef}`,
    html: `
      <div style="${baseStyles}">
        <h1 style="${headerStyles}">${status.emoji} ${status.title}</h1>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi <strong>${customerName}</strong>,</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">${status.description}</p>
        <div style="margin: 20px 0; padding: 16px; background: white; border-left: 4px solid ${status.color}; border-radius: 4px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Booking Reference:</strong> #${shortRef}
          </p>
        </div>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${trackingUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Track Your Repair
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Thank you for choosing TechnoLogiya! 🙏</p>
      </div>
    `,
  };
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      customer_name, 
      short_ref, 
      event_type, 
      repair_status, 
      amount 
    } = await req.json();

    // Only send if email is provided
    if (!email) {
      console.log("No email provided, skipping email notification");
      return new Response(
        JSON.stringify({ success: true, message: "No email provided, skipping" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getStatusEmailContent(
      customer_name,
      short_ref,
      event_type,
      repair_status,
      amount
    );

    console.log(`Sending ${event_type} email to ${email} for booking ${short_ref}`);

    const emailResponse = await sendEmail(email, customer_name, subject, html);

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Email send error:", error);
    // Sanitize error message to avoid exposing internal details
    const errorMessage = error?.message?.includes("Brevo") ? "Email service temporarily unavailable" : "Failed to send notification email";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
