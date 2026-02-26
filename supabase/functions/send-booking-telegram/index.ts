import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Retry helper with exponential backoff
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      const errorText = await response.text();
      console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, errorText);
      lastError = new Error(errorText);
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw lastError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt + 1}/${maxRetries} error:`, error);
    }
    
    // Wait before retry with exponential backoff
    if (attempt < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// Log payment event to database
async function logPaymentEvent(
  bookingId: string, 
  eventType: string, 
  errorMessage?: string, 
  metadata?: object
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) return;
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from('payment_logs').insert({
      booking_id: bookingId,
      event_type: eventType,
      error_message: errorMessage,
      metadata: metadata,
    });
  } catch (e) {
    console.error('Failed to log event:', e);
  }
}

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

    const { booking_id, customer_name, phone, amount, service, short_ref, location } = await req.json();

    if (!booking_id || !customer_name || !phone || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the short_ref from database, fallback to substring for backwards compatibility
    const shortRef = short_ref || booking_id.substring(0, 8).toUpperCase();

    // Build location line if available
    const locationLine = location 
      ? `📍 Location: [View Map](https://www.google.com/maps?q=${location})\n` 
      : "";

    const message = `🔔 *New Repair Booking*

👤 Name: ${customer_name}
📱 Phone: \`${phone}\`
🛠 Service: ${service || "Not specified"}
🆔 Ref: \`${shortRef}\`
💰 Amount: ₹${amount}
${locationLine}💳 UPI: \`sumitdasa99-3@oksbi\`

_Waiting for payment confirmation..._`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Payment Received", callback_data: `py:${shortRef}` },
          { text: "❌ Not Received", callback_data: `pn:${shortRef}` },
        ],
      ],
    };

    try {
      const response = await fetchWithRetry(
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
        },
        3 // 3 retry attempts
      );

      console.log(`Booking notification sent for ${booking_id}`);
      
      // Log successful send
      await logPaymentEvent(booking_id, 'telegram_notification_sent', undefined, { shortRef });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (telegramError) {
      const errorMessage = telegramError instanceof Error ? telegramError.message : "Unknown error";
      console.error("Telegram API error after retries:", errorMessage);
      
      // Log failure
      await logPaymentEvent(booking_id, 'telegram_notification_failed', errorMessage, { shortRef, retried: true });
      
      // Return success to client anyway - booking is created, just notification failed
      // Admin can check the database directly
      return new Response(
        JSON.stringify({ success: true, warning: "Notification delayed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in booking notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
