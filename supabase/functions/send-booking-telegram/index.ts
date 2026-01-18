import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!botToken || !chatId) {
      console.error("Telegram credentials not configured");
      return new Response(
        JSON.stringify({ error: "Telegram not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { booking_id, customer_name, phone, amount, service, short_ref } = await req.json();

    if (!booking_id || !customer_name || !phone || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the short_ref from database, fallback to substring for backwards compatibility
    const shortRef = short_ref || booking_id.substring(0, 8).toUpperCase();

    const message = `🔔 *New Repair Booking*

👤 Name: ${customer_name}
📱 Phone: \`${phone}\`
🛠 Service: ${service || "Not specified"}
🆔 Ref: \`${shortRef}\`
💰 Amount: ₹${amount}
💳 UPI: \`sumitdasa99-3@oksbi\`

_Waiting for payment confirmation..._`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Payment Received", callback_data: `py:${shortRef}` },
          { text: "❌ Not Received", callback_data: `pn:${shortRef}` },
        ],
      ],
    };

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
          reply_markup: keyboard,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
      throw new Error("Failed to send Telegram message");
    }

    console.log(`Booking notification sent for ${booking_id}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending booking notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
