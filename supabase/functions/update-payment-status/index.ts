import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const;


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

// Email notification function (backup for payment confirmation)
async function sendEmailConfirmation(booking: {
  name: string;
  phone: string;
  issue: string;
  amount: number;
  bookingRef: string;
}) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.log('Resend API key not configured, skipping email notification');
    return;
  }

  const resend = new Resend(resendApiKey);

  try {
    const { error } = await resend.emails.send({
      from: 'PC Repair Booking <onboarding@resend.dev>',
      to: ['sumitdasa08@gmail.com'],
      subject: `✅ Payment Confirmed - ${booking.bookingRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
            ✅ Payment Confirmed!
          </h2>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📋 Reference:</strong> ${booking.bookingRef}</p>
            <p><strong>👤 Customer:</strong> ${booking.name}</p>
            <p><strong>📱 Phone:</strong> ${booking.phone}</p>
            <p><strong>🔧 Service:</strong> ${booking.issue}</p>
            <p><strong>💰 Amount:</strong> ₹${booking.amount}</p>
          </div>
          
          <p style="color: #155724; background: #d4edda; padding: 10px; border-radius: 4px;">
            🎉 <strong>Status:</strong> Payment Completed Successfully
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is a backup notification. Primary notifications are sent via Telegram.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Email confirmation failed:', error);
    } else {
      console.log('Email confirmation sent successfully');
    }
  } catch (error) {
    console.error('Error sending email confirmation:', error);
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
      console.log('Processing UPI payment confirmation for order:', razorpay_order_id);
    } else {
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

    // First, check current payment status
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, payment_status')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching booking:', fetchError);
      throw new Error('Failed to fetch booking');
    }

    if (!existingBooking) {
      console.error('Booking not found for order:', razorpay_order_id);
      throw new Error('Booking not found');
    }

    // Prevent customer from overriding admin's rejection
    if (existingBooking.payment_status === 'payment_failed') {
      console.log('Payment was already rejected by admin, cannot override');
      throw new Error('Payment was rejected. Please contact support or try a new booking.');
    }

    // Don't update if already completed by Telegram confirmation
    if (existingBooking.payment_status === 'completed') {
      console.log('Payment already confirmed by admin, returning success');
      // Fetch full booking data
      const { data: fullBooking } = await supabase
        .from('bookings')
        .select('*')
        .eq('razorpay_order_id', razorpay_order_id)
        .single();
        
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Payment already confirmed',
        booking: fullBooking || existingBooking,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update booking with payment details
    // Only update if status is 'pending' - customer is confirming they made payment
    // This sets it to 'pending_verification' until admin confirms on Telegram
    const { data, error } = await supabase
      .from('bookings')
      .update({
        razorpay_payment_id,
        payment_status: 'pending_verification',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .in('payment_status', ['pending', 'pending_verification'])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update payment status');
    }

    console.log('Payment status updated to pending_verification for booking:', data.id);

    // Send Telegram notification
    const confirmationMessage = `⏳ *Payment Confirmation Pending*

📋 *Reference:* \`${razorpay_order_id}\`
👤 *Name:* ${data.name}
📱 *Phone:* ${data.phone}
🔧 *Issue:* ${data.issue}
💰 *Amount:* ₹${data.amount}

🔔 *Status:* Customer clicked "I've Completed Payment"
👆 *Action:* Check your bank and confirm via the original message buttons`;

    sendTelegramNotification(confirmationMessage).catch(err => 
      console.error('Failed to send Telegram confirmation:', err)
    );
    
    // Send email confirmation as backup (non-blocking)
    sendEmailConfirmation({
      name: data.name,
      phone: data.phone,
      issue: data.issue,
      amount: data.amount,
      bookingRef: razorpay_order_id,
    }).catch(err => 
      console.error('Failed to send email confirmation:', err)
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