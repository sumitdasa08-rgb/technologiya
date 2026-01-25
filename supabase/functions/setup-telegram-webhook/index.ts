import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');

  if (!botToken || !supabaseUrl) {
    console.error('Missing TELEGRAM_BOT_TOKEN or SUPABASE_URL');
    return new Response(JSON.stringify({ 
      error: 'Missing configuration',
      hasToken: !!botToken,
      hasUrl: !!supabaseUrl
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Construct the webhook URL for the telegram-webhook edge function
    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-webhook`;
    
    console.log('Setting up Telegram webhook to:', webhookUrl);
    console.log('Webhook secret configured:', !!webhookSecret);

    // First, get current webhook info
    const getInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const webhookInfo = await getInfoResponse.json();
    console.log('Current webhook info:', JSON.stringify(webhookInfo));

    // Build webhook configuration - include secret_token if available
    const webhookConfig: any = {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true,
    };

    // Add secret token for security (Telegram will send it as X-Telegram-Bot-Api-Secret-Token header)
    if (webhookSecret) {
      webhookConfig.secret_token = webhookSecret;
      console.log('Including secret_token in webhook configuration');
    } else {
      console.warn('TELEGRAM_WEBHOOK_SECRET not set - webhook will not be secured');
    }

    // Set the webhook
    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookConfig),
    });

    const result = await setWebhookResponse.json();
    console.log('setWebhook result:', JSON.stringify(result));

    // Get updated webhook info
    const newInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const newWebhookInfo = await newInfoResponse.json();

    return new Response(JSON.stringify({ 
      success: true,
      setWebhookResult: result,
      webhookUrl,
      secretConfigured: !!webhookSecret,
      currentWebhookInfo: newWebhookInfo,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error setting up webhook:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
