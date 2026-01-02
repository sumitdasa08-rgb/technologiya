import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const;


// Service pricing map - promotional pricing
const SERVICE_PRICING: Record<string, number> = {
  'windows_upgrade': 10,
  'software_repair': 10,
  'sound_issues': 10,
  'network_setup': 10,
  'virus_removal': 10,
  'pc_optimization': 10,
  'data_recovery': 10,
  'consultation': 10,
};

const DEFAULT_SERVICE_AMOUNT = 10;

// Telegram notification function with inline buttons
async function sendTelegramNotificationWithButtons(booking: {
  name: string;
  phone: string;
  issue: string;
  description?: string;
  amount: number;
  bookingRef: string;
}) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')?.trim();
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')?.trim();

  console.log('=== Telegram Notification Debug ===');
  console.log('Bot token exists:', !!botToken, 'Token length:', botToken?.length);
  console.log('Chat ID:', chatId);

  if (!botToken || !chatId) {
    console.error('❌ Telegram credentials not configured! Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
    return { success: false, error: 'Credentials not configured' };
  }

  const message = `🔔 *NEW BOOKING - PAYMENT PENDING*

📋 *Reference:* \`${booking.bookingRef}\`
━━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${booking.name}
📱 *Phone:* ${booking.phone}
🔧 *Service:* ${booking.issue}
${booking.description ? `📝 *Details:* ${booking.description}` : ''}
💰 *Amount:* ₹${booking.amount}
━━━━━━━━━━━━━━━━━━━━━

⏳ *Awaiting UPI Payment Confirmation*

👇 *Did you receive the payment?*`;

  // Create inline keyboard with Yes/No buttons
  const refWithoutPrefix = booking.bookingRef.replace('UPI-', '');
  const shortRef = refWithoutPrefix.substring(0, 19);
  
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Yes - Payment Received', callback_data: `py:${shortRef}` },
      ],
      [
        { text: '❌ No - Payment Not Received', callback_data: `pn:${shortRef}` },
      ]
    ]
  };

  try {
    console.log('Sending Telegram notification to chat:', chatId);
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard,
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Telegram API error:', JSON.stringify(responseData));
      return { success: false, error: responseData };
    }
    
    console.log('✅ Telegram notification sent successfully!');
    console.log('Response:', JSON.stringify(responseData));
    return { success: true, data: responseData };
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email notification function (backup)
async function sendEmailNotification(booking: {
  name: string;
  phone: string;
  issue: string;
  description?: string;
  amount: number;
  bookingRef: string;
}) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  console.log('=== Email Notification Debug ===');
  console.log('Resend API key exists:', !!resendApiKey, 'Key length:', resendApiKey?.length);
  
  if (!resendApiKey) {
    console.error('❌ Resend API key not configured! Please set RESEND_API_KEY');
    return { success: false, error: 'API key not configured' };
  }

  const resend = new Resend(resendApiKey);

  try {
    console.log('Sending email notification...');
    const { data, error } = await resend.emails.send({
      from: 'LogicLabs Booking <onboarding@resend.dev>',
      to: ['sumitdasa08@gmail.com'],
      subject: `🔔 New Booking - ${booking.bookingRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            🔔 New Booking - Payment Pending
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📋 Reference:</strong> ${booking.bookingRef}</p>
            <p><strong>👤 Customer:</strong> ${booking.name}</p>
            <p><strong>📱 Phone:</strong> ${booking.phone}</p>
            <p><strong>🔧 Service:</strong> ${booking.issue}</p>
            ${booking.description ? `<p><strong>📝 Details:</strong> ${booking.description}</p>` : ''}
            <p><strong>💰 Amount:</strong> ₹${booking.amount}</p>
          </div>
          
          <p style="color: #856404; background: #fff3cd; padding: 10px; border-radius: 4px;">
            ⏳ <strong>Status:</strong> Awaiting UPI Payment Confirmation
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is a backup notification. Primary notifications are sent via Telegram.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Email notification failed:', JSON.stringify(error));
      return { success: false, error };
    }
    
    console.log('✅ Email notification sent successfully!');
    console.log('Email ID:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const clientData = requestCounts.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  clientData.count++;
  return true;
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

function validateInput(data: { service_type?: string; name: string; phone: string; issue: string }) {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Phone is required');
  } else {
    const phoneDigits = data.phone.replace(/[\s\-\(\)]/g, '');
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      errors.push('Phone must be 10-15 digits');
    }
  }

  if (!data.issue || typeof data.issue !== 'string' || data.issue.trim().length === 0) {
    errors.push('Issue description is required');
  } else if (data.issue.length > 500) {
    errors.push('Issue must be less than 500 characters');
  }

  return errors;
}

serve(async (req) => {
  // Handle CORS preflight requests

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { service_type, name, phone, issue, description } = await req.json();

    // Validate input
    const validationErrors = validateInput({ service_type, name, phone, issue });
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return new Response(
        JSON.stringify({ error: validationErrors.join(', ') }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get amount based on service type
    const amount = SERVICE_PRICING[service_type] || DEFAULT_SERVICE_AMOUNT;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a unique booking reference
    const bookingRef = `UPI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Save booking to database with pending_verification status
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        issue: issue.trim(),
        description: description?.trim() || null,
        amount,
        currency: 'INR',
        payment_status: 'pending_verification',
        razorpay_order_id: bookingRef,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create booking');
    }

    console.log('✅ Booking created successfully:', booking.id, 'Reference:', bookingRef);

    // Send Telegram notification with Yes/No buttons
    const bookingData = {
      name: name.trim(),
      phone: phone.trim(),
      issue: issue.trim(),
      description: description?.trim(),
      amount,
      bookingRef,
    };
    
    console.log('=== Sending Notifications ===');
    
    // Send notifications
    const [telegramResult, emailResult] = await Promise.allSettled([
      sendTelegramNotificationWithButtons(bookingData),
      sendEmailNotification(bookingData)
    ]);
    
    console.log('Telegram notification result:', 
      telegramResult.status === 'fulfilled' ? JSON.stringify(telegramResult.value) : telegramResult.reason
    );
    console.log('Email notification result:', 
      emailResult.status === 'fulfilled' ? JSON.stringify(emailResult.value) : emailResult.reason
    );

    return new Response(
      JSON.stringify({
        success: true,
        bookingId: booking.id,
        bookingRef,
        amount,
        message: 'Booking created. Please complete UPI payment.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
    console.error('Error creating UPI booking:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});