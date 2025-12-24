import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Server-side pricing - client cannot modify these values
const SERVICE_PRICING: Record<string, number> = {
  'consultation': 150,
  'Consultation': 150,
  'Windows OS Upgrade': 250,
  'windows_upgrade': 250,
  'OS Changes & Updates': 300,
  'os_changes': 300,
  'Microsoft Office': 350,
  'ms_office': 350,
  'Storage Solutions': 250,
  'storage': 250,
  'Software Fixes': 300,
  'software_fixes': 300,
  'Audio Repair': 250,
  'audio_repair': 250,
  'hardware_repair': 500,
  'data_recovery': 750,
};

const DEFAULT_SERVICE_AMOUNT = 150; // Default consultation fee

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Check rate limit for an IP
const checkRateLimit = (clientIP: string): boolean => {
  const now = Date.now();
  const record = requestCounts.get(clientIP);

  if (!record || now > record.resetTime) {
    // New window or expired window
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

// Input validation
const validateInput = (data: { service_type?: string; name: string; phone: string; issue: string }) => {
  const errors: string[] = [];

  // Validate name (required, max 100 chars, no HTML)
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else if (data.name.trim().length === 0) {
    errors.push('Name cannot be empty');
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  } else if (/<[^>]*>/.test(data.name)) {
    errors.push('Name contains invalid characters');
  }

  // Validate phone (required, 10-15 digits)
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Phone is required');
  } else {
    const phoneDigits = data.phone.replace(/[\s\-\(\)]/g, '');
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      errors.push('Phone must be 10-15 digits');
    }
  }

  // Validate issue (required, max 500 chars)
  if (!data.issue || typeof data.issue !== 'string') {
    errors.push('Issue description is required');
  } else if (data.issue.trim().length === 0) {
    errors.push('Issue description cannot be empty');
  } else if (data.issue.length > 500) {
    errors.push('Issue description must be less than 500 characters');
  }

  // Validate service_type if provided
  if (data.service_type && typeof data.service_type === 'string') {
    if (!SERVICE_PRICING[data.service_type]) {
      // Don't error, just use default
      console.log('Unknown service type, using default pricing:', data.service_type);
    }
  }

  return errors;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    console.log('Rate limit exceeded, returning 429');
    return new Response(JSON.stringify({ 
      error: 'Too many requests. Please try again in a minute.' 
    }), {
      status: 429,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': '60'
      },
    });
  }

  try {
    const requestData = await req.json();
    const { service_type, name, phone, issue, description } = requestData;
    
    // Server-side input validation
    const validationErrors = validateInput({ service_type, name, phone, issue });
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return new Response(JSON.stringify({ 
        error: 'Invalid input', 
        details: validationErrors 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Server-side amount calculation - client cannot override
    const amount = SERVICE_PRICING[service_type] || DEFAULT_SERVICE_AMOUNT;
    
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!keyId || !keySecret) {
      console.error('Razorpay keys not configured');
      return new Response(JSON.stringify({ error: 'Payment service unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase not configured');
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Creating Razorpay order for amount:', amount);

    const authHeader = btoa(`${keyId}:${keySecret}`);
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          name: name.trim(),
          phone: phone.trim(),
          issue: issue.trim(),
          service_type: service_type || 'consultation',
        },
      }),
    });

    const order = await response.json();
    
    if (!response.ok) {
      console.error('Razorpay error:', order);
      // Return generic error to client
      return new Response(JSON.stringify({ error: 'Failed to create payment order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Order created successfully:', order.id);

    // Save booking to database with sanitized inputs
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        issue: issue.trim(),
        description: description ? description.trim() : null,
        amount,
        razorpay_order_id: order.id,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't expose database errors to client
    } else {
      console.log('Booking saved:', booking.id);
    }

    return new Response(JSON.stringify({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      bookingId: booking?.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating order:', errorMessage);
    // Return generic error to client
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
