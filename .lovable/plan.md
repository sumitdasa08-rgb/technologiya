
# Add Payment Confirmation Buttons to Stale Payment Alerts

## Overview
Currently, the stale payment alert sends a single summary message listing all bookings waiting for payment confirmation. You want to add "Payment Received" and "Not Received" buttons so you can confirm payments directly from the alert, just like in new booking notifications.

## Current Behavior
- `check-stale-payments` sends one combined message with a list of all stale bookings
- No interactive buttons - you have to manually find and confirm payments

## Proposed Changes

### Strategy
Instead of sending one summary message, send **individual messages for each stale booking** with payment confirmation buttons. This matches the format of new booking notifications and allows you to take action directly.

### Message Format (per booking)
```
⚠️ Stale Payment Reminder

👤 Name: Sumit Das
📱 Phone: 8876545667
🛠 Service: Software Repair
🆔 Ref: 2B528B62
💰 Amount: ₹250
⏰ Waiting: 3 hours

[✅ Payment Received] [❌ Not Received]
```

### Technical Details

**File to Modify:** `supabase/functions/check-stale-payments/index.ts`

1. **Query additional fields** - Add `service_id` to the select query for service info
2. **Send individual messages** - Loop through stale bookings and send a separate Telegram message for each one with inline keyboard buttons
3. **Use same callback format** - `py:SHORT_REF` for payment received and `pn:SHORT_REF` for not received (already handled by `telegram-webhook`)
4. **Keep summary at the end** - Optionally send a final summary count message

### Button Actions (Already Implemented)
The `telegram-webhook` function already handles these callback patterns:
- `py:SHORT_REF` - Marks payment as "confirmed"
- `pn:SHORT_REF` - Marks payment as "failed"

No changes needed to the webhook - the buttons will work immediately.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/check-stale-payments/index.ts` | Send individual messages with payment buttons for each stale booking |

## Result
- Each stale booking gets its own message with action buttons
- You can confirm or reject payments directly from the reminder
- Same experience as new booking notifications
