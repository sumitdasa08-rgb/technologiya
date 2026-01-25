import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token",
};

// Validate Telegram webhook secret token
function isValidWebhookRequest(req: Request): boolean {
  const webhookSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.warn("TELEGRAM_WEBHOOK_SECRET not configured - webhook validation disabled");
    return true; // Allow if not configured (for backwards compatibility during migration)
  }
  
  const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
  return secretToken === webhookSecret;
}

// Check if user is authorized (only admin can interact)
function isAuthorizedUser(chatId: number | string | undefined): boolean {
  if (!chatId) return false;
  const authorizedChatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!authorizedChatId) return false;
  return chatId.toString() === authorizedChatId;
}

// Update booking payment status and send email notification
async function updateBookingPaymentStatus(bookingRef: string, status: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase not configured");
    return { success: false, booking: null };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Find booking by short_ref (stored in database)
    const { data: bookings, error: findError } = await supabase
      .from("bookings")
      .select("id, payment_status, short_ref, email, customer_name, phone, amount")
      .eq("short_ref", bookingRef.toUpperCase())
      .limit(1);

    if (findError || !bookings || bookings.length === 0) {
      console.error("No booking found with short_ref:", bookingRef);
      return { success: false, booking: null };
    }

    const booking = bookings[0];
    console.log(`Updating booking ${booking.id} from ${booking.payment_status} to ${status}`);

    const { error } = await supabase
      .from("bookings")
      .update({ payment_status: status })
      .eq("id", booking.id);

    if (error) {
      console.error("Database update error:", error);
      return { success: false, booking: null };
    }

    console.log(`Booking ${booking.id} payment status updated to ${status}`);

    // Send email notification if payment confirmed and email exists
    if (status === "confirmed" && booking.email) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email: booking.email,
            customer_name: booking.customer_name,
            short_ref: booking.short_ref,
            event_type: "payment_confirmed",
            amount: booking.amount,
          }),
        });
        console.log(`Payment confirmation email queued for ${booking.email}`);
      } catch (emailError) {
        console.error("Failed to send payment email:", emailError);
        // Don't fail the whole operation if email fails
      }
    }

    return { success: true, booking };
  } catch (error) {
    console.error("Error updating booking:", error);
    return { success: false, booking: null };
  }
}

// Update booking repair status and send email notification
async function updateRepairStatus(bookingRef: string, status: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return { success: false, message: "Supabase not configured" };
  }

  const validStatuses = ["pending", "technician_called", "technician_fixing", "fixed", "customer_satisfied"];
  if (!validStatuses.includes(status)) {
    return { success: false, message: `Invalid status. Use: ${validStatuses.join(", ")}` };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Search by phone only since UUID pattern matching is complex
    const { data: bookings, error: findError } = await supabase
      .from("bookings")
      .select("id, customer_name, phone, repair_status, email, short_ref")
      .eq("phone", bookingRef)
      .order("created_at", { ascending: false })
      .limit(1);

    if (findError || !bookings || bookings.length === 0) {
      return { success: false, message: "Booking not found" };
    }

    const booking = bookings[0];

    const { error } = await supabase
      .from("bookings")
      .update({ repair_status: status })
      .eq("id", booking.id);

    if (error) {
      return { success: false, message: "Database update failed" };
    }

    // Send email notification if email exists
    if (booking.email) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email: booking.email,
            customer_name: booking.customer_name,
            short_ref: booking.short_ref,
            event_type: "status_update",
            repair_status: status,
          }),
        });
        console.log(`Status update email queued for ${booking.email}`);
      } catch (emailError) {
        console.error("Failed to send status email:", emailError);
        // Don't fail the whole operation if email fails
      }
    }

    return {
      success: true,
      message: `✅ Updated to "${status}" for ${booking.customer_name}`,
      booking,
    };
  } catch (error) {
    return { success: false, message: "Error updating status" };
  }
}

// List recent bookings
async function listRecentBookings() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return { success: false, message: "Supabase not configured" };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, customer_name, phone, repair_status, payment_status, amount, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return { success: false, message: "Failed to fetch bookings" };
    }

    return { success: true, bookings };
  } catch (error) {
    return { success: false, message: "Error fetching bookings" };
  }
}

// Answer callback query
async function answerCallbackQuery(botToken: string, callbackQueryId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: true,
      }),
    });
  } catch (error) {
    console.error("Error answering callback:", error);
  }
}

// Send Telegram message
async function sendTelegramMessage(botToken: string, chatId: string, text: string, replyMarkup?: any) {
  try {
    const body: any = {
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Send WhatsApp link message
async function sendWhatsAppLink(botToken: string, chatId: string, phone: string, customerName: string, isConfirmed: boolean, bookingRef: string) {
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = "91" + formattedPhone;
  }

  const message = isConfirmed
    ? `Hi ${customerName}! 🎉\n\nYour payment for booking *${bookingRef}* has been confirmed! ✅\n\nOur technician will contact you shortly.\n\nThank you for choosing TechnoLogiya! 🙏`
    : `Hi ${customerName},\n\nWe noticed that we haven't received the payment for your booking *${bookingRef}* yet.\n\nPlease complete the payment or contact us for assistance.\n\nThank you! 🙏`;

  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  const telegramText = isConfirmed
    ? `✅ *Payment Confirmed for ${customerName}*\n\n📋 Ref: \`${bookingRef}\`\n\n👇 Send confirmation:\n[Open WhatsApp](${whatsappUrl})`
    : `❌ *Payment Not Received for ${customerName}*\n\n📋 Ref: \`${bookingRef}\`\n\n👇 Follow up:\n[Open WhatsApp](${whatsappUrl})`;

  await sendTelegramMessage(botToken, chatId, telegramText);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!botToken) {
    return new Response(JSON.stringify({ error: "Bot not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (req.method === "GET") {
      return new Response(JSON.stringify({ ok: true, message: "Webhook active" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate webhook secret for POST requests (Telegram sends POST)
    if (req.method === "POST" && !isValidWebhookRequest(req)) {
      console.error("Invalid webhook secret token - rejecting request");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    if (!body) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const update = JSON.parse(body);
    console.log("Telegram update:", JSON.stringify(update));

    // Handle callback query (button press)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackData = callbackQuery.data;
      const chatId = callbackQuery.message?.chat?.id;
      const callbackQueryId = callbackQuery.id;

      if (!callbackData || !chatId) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check authorization
      if (!isAuthorizedUser(chatId)) {
        console.log(`Unauthorized callback from chat: ${chatId}`);
        await answerCallbackQuery(botToken, callbackQueryId, "⛔ Access denied. This bot is private.");
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Callback data:", callbackData);

      // Payment confirmation: py:shortRef or pn:shortRef
      if (callbackData.startsWith("py:") || callbackData.startsWith("pn:")) {
        const isConfirmed = callbackData.startsWith("py:");
        const shortRef = callbackData.substring(3);
        const status = isConfirmed ? "confirmed" : "failed";

        const result = await updateBookingPaymentStatus(shortRef, status);

        await answerCallbackQuery(
          botToken,
          callbackQueryId,
          result.success
            ? isConfirmed
              ? "✅ Payment confirmed!"
              : "❌ Marked as not received"
            : "⚠️ Failed to update"
        );

        // Send WhatsApp link if update succeeded
        if (result.success && result.booking) {
          await sendWhatsAppLink(
            botToken,
            chatId.toString(),
            result.booking.phone || "",
            result.booking.customer_name,
            isConfirmed,
            shortRef
          );
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Repair status: rs:phone:status:name
      if (callbackData.startsWith("rs:")) {
        const parts = callbackData.split(":");
        if (parts.length >= 3) {
          const phone = parts[1];
          const status = parts[2];

          const result = await updateRepairStatus(phone, status);
          await answerCallbackQuery(botToken, callbackQueryId, result.message);
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Menu callback: menu:phone:name
      if (callbackData.startsWith("menu:")) {
        const parts = callbackData.split(":");
        if (parts.length >= 3) {
          const phone = parts[1];
          const name = parts[2];

          const statuses = [
            { key: "technician_called", label: "Technician Assigned", icon: "📞" },
            { key: "technician_fixing", label: "Repair In Progress", icon: "🔧" },
            { key: "fixed", label: "Device Fixed", icon: "✅" },
            { key: "customer_satisfied", label: "Completed", icon: "🎉" },
          ];

          const keyboard = {
            inline_keyboard: statuses.map((s) => [
              { text: `${s.icon} ${s.label}`, callback_data: `rs:${phone}:${s.key}:${name}` },
            ]),
          };

          await sendTelegramMessage(
            botToken,
            chatId.toString(),
            `🔄 *Update Status for ${name}*\n📱 Phone: \`${phone}\`\n\n👇 Select status:`,
            keyboard
          );
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Bookings list command
      if (callbackData === "cmd:bookings") {
        await answerCallbackQuery(botToken, callbackQueryId, "Loading bookings...");
        const result = await listRecentBookings();

        if (result.success && result.bookings) {
          let message = "📋 *Recent Bookings:*\n\n";
          const buttons: any[] = [];

          result.bookings.forEach((b: any, i: number) => {
            const emoji =
              b.repair_status === "customer_satisfied"
                ? "✅"
                : b.repair_status === "fixed"
                ? "🔧"
                : b.payment_status === "confirmed"
                ? "💚"
                : "🆕";

            message += `${i + 1}. ${emoji} *${b.customer_name}*\n`;
            message += `   📱 \`${b.phone}\` | ₹${b.amount}\n`;
            message += `   💳 ${b.payment_status} | 🔧 ${b.repair_status}\n\n`;

            if (b.repair_status !== "customer_satisfied") {
              buttons.push([
                { text: `📝 ${b.customer_name}`, callback_data: `menu:${b.phone}:${b.customer_name.substring(0, 10)}` },
              ]);
            }
          });

          const keyboard = buttons.length > 0 ? { inline_keyboard: buttons } : undefined;
          await sendTelegramMessage(botToken, chatId.toString(), message, keyboard);
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle text commands
    if (update.message?.text) {
      const chatId = update.message.chat.id;

      // Check authorization
      if (!isAuthorizedUser(chatId)) {
        console.log(`Unauthorized message from chat: ${chatId}`);
        await sendTelegramMessage(
          botToken,
          chatId.toString(),
          "⛔ This bot is private. Access denied."
        );
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = update.message.text.toLowerCase().trim();

      if (text === "/bookings" || text === "/start") {
        const result = await listRecentBookings();

        if (result.success && result.bookings && result.bookings.length > 0) {
          let message = "📋 *Recent Bookings:*\n\n";
          const buttons: any[] = [];

          result.bookings.forEach((b: any, i: number) => {
            const emoji =
              b.repair_status === "customer_satisfied"
                ? "✅"
                : b.payment_status === "confirmed"
                ? "💚"
                : "🆕";

            message += `${i + 1}. ${emoji} *${b.customer_name}*\n`;
            message += `   📱 \`${b.phone}\` | ₹${b.amount}\n\n`;

            if (b.repair_status !== "customer_satisfied") {
              buttons.push([
                { text: `📝 ${b.customer_name}`, callback_data: `menu:${b.phone}:${b.customer_name.substring(0, 10)}` },
              ]);
            }
          });

          const keyboard = buttons.length > 0 ? { inline_keyboard: buttons } : undefined;
          await sendTelegramMessage(botToken, chatId.toString(), message, keyboard);
        } else {
          await sendTelegramMessage(botToken, chatId.toString(), "No bookings found.");
        }
      } else if (text === "/help") {
        await sendTelegramMessage(
          botToken,
          chatId.toString(),
          "*Available Commands:*\n\n/bookings - View recent bookings\n/help - Show this help"
        );
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
