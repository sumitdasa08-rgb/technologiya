import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS configuration - restrict to allowed origins
const getAllowedOrigin = (req: Request): string => {
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = [
    'https://ryehkycxyhdpufigcotc.lovableproject.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
};

const getCorsHeaders = (req: Request) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(req),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
});

// Escape LIKE pattern special characters to prevent injection
const escapeLikePattern = (pattern: string): string => {
  return pattern.replace(/[%_\\]/g, '\\$&');
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // Reduced to 5 requests per minute per IP for security
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Check rate limit for an IP
const checkRateLimit = (clientIP: string): boolean => {
  const now = Date.now();
  const record = requestCounts.get(clientIP);

  if (!record || now > record.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    console.log('Rate limit exceeded for IP:', clientIP);
    return false;
  }

  record.count++;
  return true;
};

// Get client IP from request headers
const getClientIP = (req: Request): string => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    console.log('Rate limit exceeded for customer lookup');
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
    );
  }

  try {
    const { name, phone, bookingRef } = await req.json();

    console.log('Received request for customer bookings:', { 
      name, 
      phone: phone ? '***' + phone.slice(-4) : 'missing',
      bookingRef: bookingRef ? bookingRef.slice(0, 4) + '***' : 'missing'
    });

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.error('Invalid name provided');
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      console.error('Invalid phone provided');
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate booking reference (required for security)
    if (!bookingRef || typeof bookingRef !== 'string' || bookingRef.trim().length < 5) {
      console.error('Invalid booking reference provided');
      return new Response(
        JSON.stringify({ error: 'Valid booking reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone format (10-digit Indian mobile)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      console.error('Invalid phone format');
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate name length
    if (name.trim().length > 100) {
      console.error('Name too long');
      return new Response(
        JSON.stringify({ error: 'Name must be less than 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate booking reference length
    if (bookingRef.trim().length > 50) {
      console.error('Booking reference too long');
      return new Response(
        JSON.stringify({ error: 'Invalid booking reference' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sanitize booking reference for LIKE pattern
    const sanitizedBookingRef = escapeLikePattern(bookingRef.trim());

    // Server-side filtering with:
    // 1. Case-insensitive name match
    // 2. Exact phone match
    // 3. Booking reference match (checks razorpay_order_id or id)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .ilike('name', name.trim())
      .eq('phone', cleanPhone)
      .or(`razorpay_order_id.ilike.%${sanitizedBookingRef}%,id.ilike.%${sanitizedBookingRef}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch bookings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${data?.length || 0} bookings for verified customer`);

    return new Response(
      JSON.stringify({ data: data || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});