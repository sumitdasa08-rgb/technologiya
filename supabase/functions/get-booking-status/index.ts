import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting map for lookup requests
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // Max lookups per IP per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { booking_id, short_ref } = await req.json();

    // Must provide exactly one identifier
    if (!booking_id && !short_ref) {
      return new Response(
        JSON.stringify({ error: "Booking ID or reference required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query - only return non-sensitive fields (NO location!)
    let query = supabase
      .from("bookings")
      .select("id, customer_name, phone, email, amount, payment_status, repair_status, created_at, service_id, short_ref");

    if (booking_id) {
      // Validate UUID format to prevent injection
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(booking_id)) {
        return new Response(
          JSON.stringify({ error: "Invalid booking ID format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      query = query.eq("id", booking_id);
    } else if (short_ref) {
      // Validate short_ref format (8 alphanumeric characters)
      const shortRefPattern = /^[A-Za-z0-9]{8}$/;
      if (!shortRefPattern.test(short_ref)) {
        return new Response(
          JSON.stringify({ error: "Invalid reference format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      query = query.eq("short_ref", short_ref.toUpperCase());
    }

    const { data: booking, error } = await query.maybeSingle();

    if (error) {
      console.error("Booking lookup error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to look up booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return booking data WITHOUT sensitive fields like location
    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          customer_name: booking.customer_name,
          phone: booking.phone,
          email: booking.email,
          amount: booking.amount,
          payment_status: booking.payment_status,
          repair_status: booking.repair_status,
          created_at: booking.created_at,
          service_id: booking.service_id,
          short_ref: booking.short_ref,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Get booking status error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
