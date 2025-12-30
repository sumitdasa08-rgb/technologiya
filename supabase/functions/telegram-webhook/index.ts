import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Answer callback query to remove loading state on button
async function answerCallbackQuery(botToken: string, callbackQueryId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: true,
      }),
    });
  } catch (error) {
    console.error('Error answering callback query:', error);
  }
}

// Send a follow-up message with WhatsApp link
async function sendWhatsAppLink(botToken: string, chatId: string, phone: string, customerName: string, isPaymentReceived: boolean, bookingRef: string) {
  // Format phone number for WhatsApp (remove any non-digits and add country code if needed)
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone; // Add India country code
  }

  let whatsappMessage: string;
  let telegramMessage: string;

  if (isPaymentReceived) {
    whatsappMessage = encodeURIComponent(
      `Hi ${customerName}! 🎉\n\n` +
      `Your payment for booking *${bookingRef}* has been confirmed! ✅\n\n` +
      `Our technician will contact you shortly to schedule the service.\n\n` +
      `Thank you for choosing TechnoLogiya! 🙏`
    );
    telegramMessage = `✅ *Payment Confirmed for ${customerName}*

📋 Reference: \`${bookingRef}\`

👇 *Click below to send confirmation on WhatsApp:*
[Send WhatsApp Message](https://wa.me/${formattedPhone}?text=${whatsappMessage})`;
  } else {
    whatsappMessage = encodeURIComponent(
      `Hi ${customerName},\n\n` +
      `We noticed that we haven't received the payment for your booking *${bookingRef}* yet.\n\n` +
      `Our assistant will call you shortly to help complete the booking.\n\n` +
      `If you've already made the payment, please share the screenshot.\n\n` +
      `Thank you! 🙏`
    );
    telegramMessage = `❌ *Payment Not Received for ${customerName}*

📋 Reference: \`${bookingRef}\`

👇 *Click below to send follow-up on WhatsApp:*
[Send WhatsApp Message](https://wa.me/${formattedPhone}?text=${whatsappMessage})`;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send WhatsApp link message:', error);
    }
  } catch (error) {
    console.error('Error sending WhatsApp link:', error);
  }
}

// Update booking status in database
async function updateBookingStatus(bookingRef: string, status: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase not configured');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: status })
      .eq('razorpay_order_id', bookingRef);

    if (error) {
      console.error('Database update error:', error);
      return false;
    }
    console.log(`Booking ${bookingRef} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating booking:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return new Response(JSON.stringify({ error: 'Bot not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Handle GET requests (Telegram webhook verification)
    if (req.method === 'GET') {
      return new Response(JSON.stringify({ ok: true, message: 'Webhook is active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    if (!body) {
      console.log('Empty request body received');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const update = JSON.parse(body);
    console.log('Received Telegram update:', JSON.stringify(update));

    // Handle callback query (button press)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackData = callbackQuery.data;
      const chatId = callbackQuery.message?.chat?.id;
      const callbackQueryId = callbackQuery.id;

      if (!callbackData || !chatId) {
        console.error('Missing callback data or chat ID');
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Processing callback data:', callbackData);

      // Parse callback data - new format: py:shortRef or pn:shortRef
      // Also support old format: payment_yes:bookingRef:phone:encodedName
      let action: string;
      let bookingRef: string;
      let phone: string | null = null;
      let customerName: string | null = null;

      if (callbackData.startsWith('py:') || callbackData.startsWith('pn:')) {
        // New short format
        const parts = callbackData.split(':');
        action = parts[0] === 'py' ? 'payment_yes' : 'payment_no';
        const shortRef = parts[1];
        bookingRef = `UPI-${shortRef}`;
        
        // Look up booking details from database
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: booking } = await supabase
            .from('bookings')
            .select('name, phone')
            .like('razorpay_order_id', `%${shortRef}%`)
            .single();
          
          if (booking) {
            phone = booking.phone;
            customerName = booking.name;
            console.log('Found booking:', customerName, phone);
          }
        }
      } else {
        // Old format: payment_yes:bookingRef:phone:encodedName
        const parts = callbackData.split(':');
        if (parts.length < 4) {
          console.error('Invalid callback data format:', callbackData);
          await answerCallbackQuery(botToken, callbackQueryId, 'Invalid action');
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        action = parts[0];
        bookingRef = parts[1];
        phone = parts[2];
        customerName = decodeURIComponent(parts[3]);
      }

      const isPaymentReceived = action === 'payment_yes';
      console.log(`Processing ${action} for booking ${bookingRef}, customer: ${customerName}, phone: ${phone}`);

      // Update booking status
      const newStatus = isPaymentReceived ? 'completed' : 'payment_failed';
      await updateBookingStatus(bookingRef, newStatus);

      // Answer callback to remove loading state
      await answerCallbackQuery(
        botToken, 
        callbackQueryId, 
        isPaymentReceived ? '✅ Payment marked as received!' : '❌ Payment marked as not received'
      );

      // Send WhatsApp link message if we have phone and name
      if (phone && customerName) {
        await sendWhatsAppLink(
          botToken,
          chatId.toString(),
          phone,
          customerName,
          isPaymentReceived,
          bookingRef
        );
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
