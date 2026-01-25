import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting map (in-memory, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // Max bookings per IP per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);

  if (!record || now > record.resetTime) {
    // New window
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
        JSON.stringify({ error: "Too many bookings. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { customer_name, phone, service_id, location, email } = await req.json();

    // Validate customer_name
    if (!customer_name || typeof customer_name !== "string") {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedName = customer_name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be 1-100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone
    if (!phone || typeof phone !== "string") {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phoneDigits = phone.replace(/[\s\-\(\)]/g, "");
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number (10-15 digits required)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate service_id
    if (!service_id || typeof service_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Service selection is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch service price from database SERVER-SIDE (prevents price manipulation)
    const { data: service, error: serviceError } = await supabase
      .from("service_pricing")
      .select("id, label, price, is_active")
      .eq("id", service_id)
      .eq("is_active", true)
      .maybeSingle();

    if (serviceError || !service) {
      console.error("Service lookup error:", serviceError);
      return new Response(
        JSON.stringify({ error: "Invalid or inactive service selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate location format if provided (optional field)
    let validatedLocation: string | null = null;
    if (location && typeof location === "string") {
      // Expected format: "latitude,longitude" (e.g., "26.123456,91.789012")
      const locationPattern = /^-?\d{1,3}\.\d{1,8},-?\d{1,3}\.\d{1,8}$/;
      if (locationPattern.test(location)) {
        validatedLocation = location;
      }
      // Silently ignore invalid location - it's optional
    }

    // Validate email format if provided (optional field)
    let validatedEmail: string | null = null;
    if (email && typeof email === "string") {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (emailRegex.test(email.trim())) {
        validatedEmail = email.trim().toLowerCase();
      }
      // Silently ignore invalid email - it's optional
    }

    // Create booking with SERVER-DETERMINED amount (not client-provided)
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        customer_name: trimmedName,
        phone: phoneDigits,
        service_id: service.id,
        amount: service.price, // SERVER-SIDE PRICE - cannot be manipulated
        payment_status: "processing",
        repair_status: "pending",
        location: validatedLocation,
        email: validatedEmail,
      })
      .select("id, customer_name, phone, email, amount, service_id, short_ref, payment_status, repair_status, created_at")
      .single();

    if (insertError) {
      console.error("Booking insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Booking created: ${booking.id} for ${trimmedName}, ₹${service.price}`);

    // Fire-and-forget Telegram notification (non-blocking for fast redirect)
    fetch(`${supabaseUrl}/functions/v1/send-booking-telegram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        booking_id: booking.id,
        short_ref: booking.short_ref,
        customer_name: trimmedName,
        phone: phoneDigits,
        amount: service.price,
        service: service.label,
        location: validatedLocation,
      }),
    }).catch(err => console.error("Background Telegram notification failed:", err));

    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          customer_name: booking.customer_name,
          phone: booking.phone,
          amount: booking.amount,
          service_id: booking.service_id,
          short_ref: booking.short_ref,
          payment_status: booking.payment_status,
          repair_status: booking.repair_status,
          created_at: booking.created_at,
        },
        service: {
          label: service.label,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
