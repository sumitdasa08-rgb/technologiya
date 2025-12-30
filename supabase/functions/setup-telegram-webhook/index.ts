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

    // First, get current webhook info
    const getInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const webhookInfo = await getInfoResponse.json();
    console.log('Current webhook info:', JSON.stringify(webhookInfo));

    // Set the webhook
    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      }),
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
