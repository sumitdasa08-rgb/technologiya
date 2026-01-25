import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hours before a payment is considered stale
const STALE_THRESHOLD_HOURS = 2;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!botToken || !chatId || !supabaseUrl || !supabaseKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find bookings stuck in "processing" for too long
    const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000).toISOString();
    
    const { data: staleBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("id, customer_name, phone, amount, short_ref, created_at")
      .eq("payment_status", "processing")
      .lt("created_at", staleThreshold)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching stale bookings:", fetchError);
      throw fetchError;
    }

    if (!staleBookings || staleBookings.length === 0) {
      console.log("No stale payments found");
      return new Response(
        JSON.stringify({ success: true, message: "No stale payments", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build reminder message
    let message = `⚠️ *Stale Payments Alert*\n\n`;
    message += `${staleBookings.length} booking(s) waiting for payment confirmation for over ${STALE_THRESHOLD_HOURS} hours:\n\n`;

    staleBookings.forEach((b, i) => {
      const hoursAgo = Math.round((Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60));
      message += `${i + 1}. *${b.customer_name}*\n`;
      message += `   📱 \`${b.phone}\` | ₹${b.amount}\n`;
      message += `   🆔 Ref: \`${b.short_ref || b.id.substring(0, 8).toUpperCase()}\`\n`;
      message += `   ⏰ ${hoursAgo}h ago\n\n`;
    });

    message += `_Please check and confirm payments or follow up with customers._`;

    // Send reminder to admin
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send stale payment alert:", error);
      throw new Error(error);
    }

    // Log this check
    await supabase.from('payment_logs').insert({
      event_type: 'stale_payment_check',
      metadata: { 
        count: staleBookings.length, 
        bookingIds: staleBookings.map(b => b.id),
        threshold_hours: STALE_THRESHOLD_HOURS 
      },
    });

    console.log(`Stale payment alert sent for ${staleBookings.length} bookings`);

    return new Response(
      JSON.stringify({ success: true, count: staleBookings.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking stale payments:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
