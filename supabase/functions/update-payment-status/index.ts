import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP
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

// Telegram notification function
async function sendTelegramNotification(message: string) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!botToken || !chatId) {
    console.log('Telegram credentials not configured, skipping notification');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram notification failed:', error);
    } else {
      console.log('Telegram notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

// Verify Razorpay signature using HMAC SHA256
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, messageData);
  const generatedSignature = new TextDecoder().decode(hexEncode(new Uint8Array(signatureBuffer)));

  return generatedSignature === signature;
}

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      console.error('Missing required payment parameters');
      throw new Error('Missing required payment parameters');
    }

    // Check if this is a UPI payment (manual confirmation) or Razorpay payment
    const isUPIPayment = razorpay_order_id.startsWith('UPI-');

    if (isUPIPayment) {
      // UPI payments use manual confirmation - no signature verification needed
      console.log('Processing UPI payment confirmation for order:', razorpay_order_id);
    } else {
      // Razorpay payments require signature verification
      if (!razorpay_signature) {
        console.error('Missing signature for Razorpay payment');
        throw new Error('Missing required payment parameters');
      }

      const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
      if (!razorpayKeySecret) {
        console.error('Razorpay secret not configured');
        throw new Error('Payment verification not configured');
      }

      const isValidSignature = await verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        razorpayKeySecret
      );

      if (!isValidSignature) {
        console.error('Invalid Razorpay signature for order:', razorpay_order_id);
        throw new Error('Payment verification failed - invalid signature');
      }

      console.log('Signature verified successfully for order:', razorpay_order_id);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase not configured');
      throw new Error('Database not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Updating payment status for order:', razorpay_order_id);

    // Update booking with payment details
    const { data, error } = await supabase
      .from('bookings')
      .update({
        razorpay_payment_id,
        payment_status: 'completed',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update payment status');
    }

    console.log('Payment status updated for booking:', data.id);

    // Send Telegram notification for payment confirmation
    const confirmationMessage = `✅ *Payment Confirmed!*

📋 *Reference:* \`${razorpay_order_id}\`
👤 *Name:* ${data.name}
📱 *Phone:* ${data.phone}
🔧 *Issue:* ${data.issue}
💰 *Amount:* ₹${data.amount}

🎉 *Status:* Payment Completed`;

    sendTelegramNotification(confirmationMessage).catch(err => 
      console.error('Failed to send confirmation notification:', err)
    );

    return new Response(JSON.stringify({ 
      success: true,
      booking: data,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating payment:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
