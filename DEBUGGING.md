# 🔧 Local Debugging & Troubleshooting Guide

## Webhook Testing Checklist

### Telegram Webhook Testing

#### ✅ Prerequisite Check
```bash
# 1. Verify credentials are set
grep "TELEGRAM_BOT_TOKEN\|TELEGRAM_CHAT_ID\|TELEGRAM_WEBHOOK_SECRET" .env.local

# 2. Test bot token validity
curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"

# 3. Get your chat ID (send message to bot first, then run)
curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```

#### ✅ Local Test (No Webhook)
```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Send test Telegram notification
curl -X POST http://localhost:54321/functions/v1/send-booking-telegram \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "test-id",
    "customer_name": "Test",
    "phone": "+919876543210",
    "amount": 500,
    "service": "Test",
    "short_ref": "TEST001"
  }'

# Expected: Should see message in Telegram group
# If not: Check logs in Terminal 1 for errors
```

#### ✅ Webhook Setup (Production Only)
```bash
# 1. Get public URL (using ngrok)
ngrok http 54321
# Note the HTTPS URL: https://xxxx.ngrok.io

# 2. Setup webhook
curl -X POST http://localhost:54321/functions/v1/setup-telegram-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://xxxx.ngrok.io/functions/v1/telegram-webhook"
  }'

# 3. Test webhook handler
curl -X POST https://xxxx.ngrok.io/functions/v1/telegram-webhook \
  -H "Content-Type: application/json" \
  -H "x-telegram-bot-api-secret-token: YOUR_WEBHOOK_SECRET" \
  -d '{
    "update_id": 123456789,
    "callback_query": {
      "id": "callback_id",
      "from": {"id": 123456789},
      "data": "py:TEST001"
    }
  }'
```

---

### Email Webhook Testing

#### ✅ Prerequisites
```bash
# 1. Check Brevo credentials
echo "BREVO_API_KEY: $BREVO_API_KEY"
echo "SENDER_EMAIL: $SENDER_EMAIL"

# 2. Verify email is registered in Brevo (check https://app.brevo.com/settings/senders)
```

#### ✅ Local Email Test
```bash
# Send test email (requires local Supabase running)
curl -X POST http://localhost:54321/functions/v1/send-booking-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "customer_name": "Test User",
    "short_ref": "TEST001",
    "event_type": "payment_confirmed",
    "amount": 500
  }'

# Check response and logs
```

#### ✅ Debug Email Errors
```bash
# If email didn't send, check these:

# 1. Is BREVO_API_KEY valid?
curl -X GET "https://api.brevo.com/v3/account" \
  -H "api-key: YOUR_BREVO_API_KEY"

# 2. Is SENDER_EMAIL verified?
# Go to https://app.brevo.com/settings/senders and check

# 3. Check Brevo API limits
curl -X GET "https://api.brevo.com/v3/smtp/statistics" \
  -H "api-key: YOUR_BREVO_API_KEY"
```

---

### Frontend to Backend Integration Testing

#### ✅ End-to-End Booking Flow

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start Supabase
supabase start

# Terminal 3: Watch Supabase logs
supabase functions list
# Then monitor real-time logs (see below)

# Terminal 4: In browser, open http://localhost:5173
# Fill the form and click "Book Now"

# Expected flow:
# 1. Frontend makes POST to /functions/v1/create-booking
# 2. Supabase returns booking with short_ref
# 3. Background: Telegram message sent
# 4. User sees success message with booking ref
# 5. User can visit /track to check status
```

#### ✅ Monitor Real-Time Logs
```bash
# Watch Supabase edge function logs
supabase functions list

# Or use tail for continuous output
tail -f ~/.supabase/logs/edge-runtime.log | grep "Telegram\|Email\|Error"
```

#### ✅ Debug Failed Bookings
```bash
# Check if service data exists
psql postgresql://postgres:postgres@localhost:5432/postgres -c "SELECT * FROM service_pricing LIMIT 5;"

# Check recent bookings
psql postgresql://postgres:postgres@localhost:5432/postgres -c "SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5;"

# Check payment logs
psql postgresql://postgres:postgres@localhost:5432/postgres -c "SELECT * FROM payment_logs ORDER BY created_at DESC LIMIT 10;"
```

---

## Performance Testing

### Load Testing Create-Booking
```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 -p payload.json -T application/json http://localhost:54321/functions/v1/create-booking

# Where payload.json contains:
# {
#   "customer_name": "Load Test",
#   "phone": "+919876543210",
#   "service_id": "screen",
#   "location": "Test",
#   "booking_date": "2026-03-20",
#   "booking_time": "14:00",
#   "issue": "Test"
# }
```

### Monitor Supabase Resources
```bash
# Check Supabase container health
docker ps | grep supabase

# Check resource usage
docker stats supabase_postgres_1

# Check Postgres connections
psql postgresql://postgres:postgres@localhost:5432/postgres \
  -c "SELECT count(*) FROM pg_stat_activity WHERE state != 'idle';"
```

---

## Rate Limiting Testing

### Test Rate Limit (Get-Booking-Status)
```bash
# Should allow 30 requests per minute per IP

# Test 1: Rapid requests (should fail after 30)
for i in {1..35}; do
  echo "Request $i:"
  curl -s http://localhost:54321/functions/v1/get-booking-status?ref=TEST001 | grep -o "error\|success"
done

# Test 2: Check rate limit headers
curl -v http://localhost:54321/functions/v1/get-booking-status?ref=TEST001 2>&1 | grep -i "x-ratelimit\|x-rate"
```

---

## CORS Testing

### Test CORS Headers
```bash
# Preflight request (OPTIONS)
curl -X OPTIONS http://localhost:54321/functions/v1/create-booking \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v

# Look for these headers in response:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: ...
# Access-Control-Allow-Headers: ...

# Test from specific origin
curl -X OPTIONS http://localhost:54321/functions/v1/create-booking \
  -H "Origin: http://localhost:5173" \
  -v
```

---

## Database Inspection

### Common Queries
```bash
# Connect to local database
psql postgresql://postgres:postgres@localhost:5432/postgres

# Inside psql:

-- Check all tables
\dt

-- List recent bookings
SELECT id, short_ref, customer_name, phone, payment_status, repair_status, created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 20;

-- Find booking by reference
SELECT * FROM bookings WHERE short_ref = 'ABC123XY';

-- Check payment logs
SELECT booking_id, event_type, error_message, metadata, created_at
FROM payment_logs
ORDER BY created_at DESC
LIMIT 20;

-- Check service data
SELECT id, name, price, is_active, display_order FROM service_pricing;

-- Count bookings by status
SELECT payment_status, COUNT(*)
FROM bookings
GROUP BY payment_status;

-- Find failed payments
SELECT * FROM payment_logs WHERE error_message IS NOT NULL ORDER BY created_at DESC;
```

---

## Network Debugging

### Capture API Calls
```bash
# Monitor HTTP traffic on localhost:54321
tcpdump -i lo -n 'port 54321' -A

# Or use mitmproxy
mitmproxy -p 8888
# Then set proxy: http://localhost:8888

# Monitor specific endpoint
curl -v http://localhost:54321/functions/v1/create-booking -X POST ...
```

### Check APIResponse Headers
```bash
# Get full headers
curl -i http://localhost:54321/functions/v1/get-booking-status?ref=TEST001

# Save full request/response
curl -w '\n%{http_code}\n' -o response.body http://localhost:54321/functions/v1/get-booking-status?ref=TEST001
```

---

## Browser Developer Tools Tips

### Frontend Debugging
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Make a booking
4. Watch requests to:
   - `http://localhost:54321/functions/v1/create-booking`
5. Check **Response** tab for server response
6. Check **Console** for JavaScript errors

### Storage
1. Go to **Application** tab
2. Check **Local Storage** for:
   - User preferences
   - Cached booking data
3. Check **Service Workers** for PWA status

### Performance
1. Go to **Performance** tab
2. Click Record
3. Make a booking
4. Click Stop
5. See timeline of:
   - Network requests
   - JavaScript execution
   - React re-renders

---

## Common Error Patterns

### Error: "TELEGRAM_BOT_TOKEN not configured"
**Cause:** Missing environment variable
**Fix:**
```bash
# Check .env.local
grep TELEGRAM_BOT_TOKEN .env.local

# Update supabase/.env.local (for edge functions)
cat .env.local | supabase secrets set
```

### Error: "Brevo API error"
**Causes:**
- Invalid API key
- Email not verified
- Rate limit exceeded
- Invalid recipient email

**Debug:**
```bash
# Test Brevo API directly
curl -X GET https://api.brevo.com/v3/account \
  -H "api-key: YOUR_KEY"

# Should return 200 with account info
```

### Error: "WEBHOOK_SECRET mismatch"
**Cause:** Secret in header doesn't match environment variable
**Fix:**
```bash
# Generate new secret
openssl rand -hex 16

# Update in .env.local and Telegram setup
```

### Error: "Booking not found"
**Cause:** Booking ref doesn't exist in database
**Debug:**
```bash
# Check exact booking ref stored
psql postgresql://postgres:postgres@localhost:5432/postgres \
  -c "SELECT short_ref FROM bookings WHERE id = 'uuid-here';"

# Note: short_ref is case-sensitive
```

---

## Quick Health Check Script

```bash
#!/bin/bash
# Save as: health-check.sh
# Run: bash health-check.sh

echo "🔍 Technologiya Health Check"
echo "============================\n"

# Check dependencies
command -v node &> /dev/null && echo "✅ Node installed" || echo "❌ Node not found"
command -v supabase &> /dev/null && echo "✅ Supabase CLI installed" || echo "❌ Supabase CLI not found"
command -v psql &> /dev/null && echo "✅ PostgreSQL CLI installed" || echo "❌ PostgreSQL CLI not found"

echo "\n🌍 Checking services..."

# Test frontend
curl -s http://localhost:5173 > /dev/null && echo "✅ Frontend running" || echo "❌ Frontend not running"

# Test Supabase API
curl -s http://localhost:54321/functions/v1/create-booking \
  -X OPTIONS > /dev/null && echo "✅ Supabase API running" || echo "❌ Supabase API not running"

# Test database
psql postgresql://postgres:postgres@localhost:5432/postgres \
  -c "SELECT 1;" > /dev/null 2>&1 && echo "✅ Database connected" || echo "❌ Database not connected"

echo "\n✨ Health check complete!"
```

---

## Still Stuck?

1. Read error message carefully - they're usually clear
2. Check logs in `supabase start` terminal
3. Run `node test-webhooks.js` for automated diagnosis
4. Review `.env.local` - missing credentials are #1 issue
5. Ensure `supabase start` is running in another terminal
6. Check file paths and make sure you're in the right directory

**Pro Tip:** When asking for help, include:
- Error message (full output)
- Which step you're on
- Output of `node test-webhooks.js`
- Contents of `.env.local` (minus sensitive info)
