# Technologiya - Local Development & Testing Guide

## Prerequisites

Before you start, ensure you have installed:
- **Node.js** (v18+) - Download from https://nodejs.org
- **Git** - https://git-scm.com
- **Supabase CLI** - Run: `npm install -g supabase`
- **Deno** - Download from https://deno.com (for running edge functions)

Optional but recommended:
- **ngrok** - For testing webhooks locally: https://ngrok.com
- **Postman** or **Insomnia** - For API testing
- **VS Code** with REST Client extension

---

## Part 1: Frontend Setup

### Step 1: Install Dependencies

```bash
cd d:\Technologiya\technologiya
npm install
```

### Step 2: Configure Environment Variables

1. The `.env.local` file has been created for you
2. Update it with your actual credentials:
   - `TELEGRAM_BOT_TOKEN` - Get from BotFather on Telegram
   - `TELEGRAM_CHAT_ID` - Your Telegram chat ID (the admin group/channel)
   - `TELEGRAM_WEBHOOK_SECRET` - Create a random secret (min 32 chars)
   - `BREVO_API_KEY` - From your Brevo account
   - `UPI_ID` - Your actual UPI ID

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

🎯 **Check these pages:**
- Home: http://localhost:5173 (should show the booking form)
- Track: http://localhost:5173/track (booking status page)
- Terms: http://localhost:5173/terms

---

## Part 2: Local Supabase & Edge Functions

### Step 1: Initialize Supabase Locally

```bash
cd d:\Technologiya\technologiya
supabase init
```

(If already initialized, skip this)

### Step 2: Start Local Supabase

```bash
supabase start
```

You'll see output like:
```
Started Supabase local development server.

API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:5432/postgres
```

✅ **Important URLs to note:**
- API: `http://localhost:54321`
- Postgres: `postgresql://postgres:postgres@localhost:5432/postgres`
- Studio (UI): http://localhost:54323

### Step 3: Create Test Data in Local Supabase

1. Open Supabase Studio: http://localhost:54323
2. Login with email: `supabase` and password: `supabase`
3. Go to **SQL Editor** and run the database migrations:

```sql
-- Create service_pricing table if not exists
CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Insert test services
INSERT INTO service_pricing (name, price, description, display_order)
VALUES
  ('Screen Replacement', 500, 'Replace broken screen', 1),
  ('Battery Replacement', 800, 'Replace phone battery', 2),
  ('Motherboard Repair', 3000, 'Repair or replace motherboard', 3);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_ref TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_id UUID,
  location TEXT,
  booking_date TIMESTAMP,
  booking_time TEXT,
  issue TEXT,
  amount INTEGER,
  payment_status TEXT DEFAULT 'pending',
  repair_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

-- Create payment_logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  event_type TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## Part 3: Testing Edge Functions Locally

### Step 1: Test Create-Booking Function

**File:** `test_create_booking.http`

```http
### Test Create Booking
POST http://localhost:54321/functions/v1/create-booking
Content-Type: application/json

{
  "customer_name": "Test User",
  "phone": "+919876543210",
  "email": "test@example.com",
  "service_id": "screen-replacement",
  "location": "Delhi, India",
  "booking_date": "2026-03-15",
  "booking_time": "14:00",
  "issue": "Cracked screen"
}
```

✅ **Expected Response:**
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "short_ref": "ABC123XY",
    "customer_name": "Test User",
    "phone": "+919876543210",
    "email": "test@example.com",
    "amount": 500,
    "payment_status": "pending",
    "created_at": "2026-02-28T12:00:00Z"
  }
}
```

### Step 2: Test Get-Booking-Status Function

```http
### Get Booking Status
GET http://localhost:54321/functions/v1/get-booking-status?ref=ABC123XY
```

✅ **Expected Response:**
```json
{
  "success": true,
  "booking": {
    "short_ref": "ABC123XY",
    "customer_name": "Test User",
    "phone": "+919876543210",
    "payment_status": "pending",
    "repair_status": "pending",
    "created_at": "2026-02-28T12:00:00Z"
  }
}
```

### Step 3: Test Send-Booking-Email Function

```http
### Send Email
POST http://localhost:54321/functions/v1/send-booking-email
Content-Type: application/json

{
  "email": "test@example.com",
  "customer_name": "Test User",
  "short_ref": "ABC123XY",
  "event_type": "payment_confirmed",
  "amount": 500,
  "repair_status": "pending"
}
```

✅ **Expected Response:**
```json
{
  "success": true,
  "emailResponse": {
    "messageId": "<abc123@brevo.com>"
  }
}
```

**Note:** Check your console logs for the actual email sending attempt. It will fail if `BREVO_API_KEY` is not configured, but you'll see the error message.

---

## Part 4: Testing Telegram & Webhooks

### Option A: Using NGrok for Telegram Webhooks

#### Step 1: Install and Start NGrok

```bash
# Download from https://ngrok.com or use npm
npm install -g ngrok

# Start ngrok tunnel (it creates a public URL pointing to localhost)
ngrok http 54321
```

Output:
```
Forwarding                    https://abc123xy.ngrok.io -> http://localhost:54321
```

Copy the `https://abc123xy.ngrok.io` URL

#### Step 2: Update Environment Variable

Edit `.env.local`:
```
NGROK_URL="https://abc123xy.ngrok.io"
```

#### Step 3: Run Setup-Telegram-Webhook Function

```http
### Setup Telegram Webhook
POST http://localhost:54321/functions/v1/setup-telegram-webhook
Content-Type: application/json

{
  "webhook_url": "https://abc123xy.ngrok.io/functions/v1/telegram-webhook"
}
```

✅ **Expected Response:**
```json
{
  "success": true,
  "message": "Webhook configured successfully",
  "webhook_url": "https://abc123xy.ngrok.io/functions/v1/telegram-webhook"
}
```

#### Step 4: Send Test Telegram Notification

```http
### Send Telegram Notification
POST http://localhost:54321/functions/v1/send-booking-telegram
Content-Type: application/json

{
  "booking_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_name": "Test User",
  "phone": "+919876543210",
  "amount": 500,
  "service": "Screen Replacement",
  "short_ref": "TEST123",
  "location": "Delhi"
}
```

✅ **Expected Result:** You should receive a message in your Telegram chat!

### Option B: Testing Telegram Without NGrok (Local Testing)

If you don't want to use NGrok, you can still test the Telegram function locally:

```http
### Test Telegram Function (Local)
POST http://localhost:54321/functions/v1/send-booking-telegram
Content-Type: application/json

{
  "booking_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_name": "Test User",
  "phone": "+919876543210",
  "amount": 500,
  "service": "Screen Replacement",
  "short_ref": "TEST123"
}
```

Check the local Supabase logs to see if the function executed correctly.

---

## Part 5: Complete Integration Test Flow

### Simulate Full Booking Flow

1. **Frontend → Create Booking**
   - Go to http://localhost:5173
   - Fill in the booking form and submit
   - Check browser console for API calls

2. **Backend → Create Booking Edge Function**
   - Check `supabase start` console logs
   - Verify booking is created in database
   - Look for Telegram notification attempt

3. **Admin → Telegram Webhook**
   - Telegram message arrives (if configured)
   - Click "✅ Payment Received" button
   - This triggers the webhook

4. **Backend → Telegram Webhook Handler**
   - Updates payment status in database
   - Sends email confirmation

5. **User → Receive Status Update**
   - Email sent (check if BREVO_API_KEY is valid)
   - User can track on `/track` page

---

## Part 6: Debugging & Logs

### View Supabase Logs

While `supabase start` is running:
- **Edge Function logs:** Visible in the terminal
- **Database logs:** Supabase Studio → Logs
- **API requests:** Supabase Studio → Logs

### View Frontend Console

```javascript
// Enable debug mode in browser console
localStorage.setItem('DEBUG_MODE', 'true');

// Then check console output from components
```

### Check Database

```sql
-- Check all bookings
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;

-- Check payment logs
SELECT * FROM payment_logs ORDER BY created_at DESC LIMIT 10;

-- Check service pricing
SELECT * FROM service_pricing;
```

---

## Part 7: Common Issues & Solutions

### ❌ Issue: "Supabase CLI not found"
**Solution:** Install it with `npm install -g supabase`

### ❌ Issue: "Edge functions returning 404"
**Solution:**
- Check if `supabase start` is running
- Verify URLs use `http://localhost:54321` (not https)
- Check function names in `.http` files match the function directories

### ❌ Issue: "Telegram messages not sending"
**Solutions:**
- Verify `TELEGRAM_BOT_TOKEN` is valid
- Ensure `TELEGRAM_CHAT_ID` is correct
- Check that bot is added to the group/channel
- Review logs in `supabase start` terminal

### ❌ Issue: "Email not sending"
**Solutions:**
- Check `BREVO_API_KEY` is correct
- Verify `SENDER_EMAIL` is registered in Brevo
- Check Brevo API limits not exceeded
- Look for errors in edge function logs

### ❌ Issue: "Webhook validation fails"
**Solution:** Make sure `TELEGRAM_WEBHOOK_SECRET` matches exactly in:
- `.env.local`
- Telegram webhook request header: `x-telegram-bot-api-secret-token`

---

## Part 8: Testing with HTTP Client Files

Create these files in your project root for easier testing:

### File: `test_apis.http`

```http
# Copy this to your project and use with REST Client VS Code extension
# Install: https://marketplace.visualstudio.com/items?itemName=humao.rest-client

### Local Supabase Base
@localhost = http://localhost:54321
@ngrok = https://your-ngrok-url.ngrok.io

### Test 1: Create Booking
POST {{localhost}}/functions/v1/create-booking
Content-Type: application/json

{
  "customer_name": "Ahmed Test",
  "phone": "+919876543210",
  "email": "test@example.com",
  "service_id": "screen-replacement",
  "location": "New Delhi",
  "booking_date": "2026-03-20",
  "booking_time": "15:30",
  "issue": "Screen cracked"
}

### Test 2: Get Booking Status
GET {{localhost}}/functions/v1/get-booking-status?ref=ABC123XY

### Test 3: Send Telegram
POST {{localhost}}/functions/v1/send-booking-telegram
Content-Type: application/json

{
  "booking_id": "123e4567-e89b-12d3-a456-426614174000",
  "customer_name": "Test",
  "phone": "+919876543210",
  "amount": 799,
  "service": "Screen Replacement",
  "short_ref": "TEST001"
}

### Test 4: Send Email
POST {{localhost}}/functions/v1/send-booking-email
Content-Type: application/json

{
  "email": "test@example.com",
  "customer_name": "Test User",
  "short_ref": "TEST001",
  "event_type": "payment_confirmed",
  "amount": 799
}
```

---

## Part 9: Deployment Verification

After confirming everything works locally:

1. **Deploy to Production:**
   ```bash
   supabase deploy
   ```

2. **Test Production Endpoints:**
   - Update `.env.local` to use production URLs
   - Re-run the integration tests

3. **Monitor Production:**
   - Supabase Dashboard → Logs
   - Check Telegram notifications in production group
   - Verify emails are being sent

---

## Quick Reference

| Component | Local URL | Status |
|-----------|-----------|--------|
| Frontend | http://localhost:5173 | ✅ Ready |
| Supabase API | http://localhost:54321 | ✅ Ready |
| Supabase Studio | http://localhost:54323 | ✅ Ready |
| Postgres | postgresql://postgres:postgres@localhost:5432/postgres | ✅ Ready |
| NGrok (optional) | https://your-ngrok-*.ngrok.io | ✅ Ready |

---

**Need help?** Check the console logs and `.env.local` configuration first!
