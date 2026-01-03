import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const;

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 5;
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

function validateInput(data: { name: string; phone: string; issue: string }) {
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

async function sendTelegramNotification(contact: {
  name: string;
  phone: string;
  issue: string;
  message?: string;
}) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')?.trim();
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')?.trim();

  console.log('Telegram config - Bot token exists:', !!botToken, 'Chat ID:', chatId);

  if (!botToken || !chatId) {
    console.error('Telegram credentials not configured');
    return { success: false, error: 'Telegram not configured' };
  }

  const telegramMessage = `📩 *NEW CONTACT REQUEST*

━━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${contact.name}
📱 *Phone:* ${contact.phone}
🔧 *Issue:* ${contact.issue}
${contact.message ? `📝 *Details:* ${contact.message}` : ''}
━━━━━━━━━━━━━━━━━━━━━

⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

📞 *Action:* Call the customer back!`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Telegram API error:', JSON.stringify(responseData));
      return { success: false, error: responseData };
    }
    
    console.log('Telegram notification sent successfully');
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, phone, issue, message } = await req.json();

    const validationErrors = validateInput({ name, phone, issue });
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return new Response(
        JSON.stringify({ error: validationErrors.join(', ') }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await sendTelegramNotification({
      name: name.trim(),
      phone: phone.trim(),
      issue: issue.trim(),
      message: message?.trim(),
    });

    if (!result.success) {
      console.error('Failed to send notification:', result.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send message. Please call us directly.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Your request has been sent. We will call you back shortly!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
