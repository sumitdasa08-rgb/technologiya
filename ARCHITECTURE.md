# 🏗️ Technologiya Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                          │
│                      http://localhost:5173                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React App (Vite)                                        │  │
│  │  ⚙️ Fixed: UpdatePrompt.tsx (promise rejection)          │  │
│  │  ⚙️ Fixed: BookingSection.tsx (error state)              │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────────┘
                   │ HTTP/REST (CORS enabled)
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Supabase Backend                               │
│              http://localhost:54321 (local)                     │
│              https://ryehkycxyhdpufigcotc.supabase.co (prod)    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ EDGE FUNCTIONS (Deno)                                    │  │
│  │                                                          │  │
│  │ 📍 /create-booking                                      │  │
│  │    → Validates input, generates short_ref              │  │
│  │    → Calls send-booking-telegram (background)          │  │
│  │    ⚙️ Returns booking to frontend                        │  │
│  │                                                          │  │
│  │ 📍 /get-booking-status                                  │  │
│  │    → Rate limited (30 req/min)                          │  │
│  │    → Returns booking + repair status                    │  │
│  │                                                          │  │
│  │ 📍 /send-booking-telegram                               │  │
│  │    ⚙️ Fixed: UPI moved to env var                        │  │
│  │    → Sends Telegram message to admin                    │  │
│  │    → Logs to payment_logs table                         │  │
│  │                                                          │  │
│  │ 📍 /send-booking-email                                  │  │
│  │    ⚙️ Fixed: Email moved to env var                      │  │
│  │    ⚙️ Fixed: Error messages sanitized                    │  │
│  │    → Calls Brevo API to send emails                     │  │
│  │                                                          │  │
│  │ 📍 /telegram-webhook                                    │  │
│  │    ⚙️ Fixed: Strict auth validation                      │  │
│  │    → Receives callback_query from Telegram              │  │
│  │    → Updates payment_status in bookings table           │  │
│  │    → Calls send-booking-email                          │  │
│  │                                                          │  │
│  │ 📍 /setup-telegram-webhook                              │  │
│  │    → Configures Telegram webhook URL                    │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ DATABASE (PostgreSQL)                                    │  │
│  │                                                          │  │
│  │ 📊 bookings                                              │  │
│  │    ├─ id (UUID, PK)                                      │  │
│  │    ├─ short_ref (unique, e.g. ABC123XY)                 │  │
│  │    ├─ customer_name, phone, email                        │  │
│  │    ├─ service_id, location, issue                        │  │
│  │    ├─ booking_date, booking_time                         │  │
│  │    ├─ amount, payment_status, repair_status             │  │
│  │    └─ created_at, updated_at                             │  │
│  │                                                          │  │
│  │ 📊 service_pricing                                       │  │
│  │    ├─ id, name, price, description                       │  │
│  │    ├─ is_active, display_order                           │  │
│  │    └─ created_at                                         │  │
│  │                                                          │  │
│  │ 📊 payment_logs                                          │  │
│  │    ├─ id, booking_id                                     │  │
│  │    ├─ event_type, error_message, metadata                │  │
│  │    └─ created_at                                         │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────┬──────────────┬──────────────┬───────────────────────────────┘
     │              │              │
     │ Telegram     │ Email        │ Database
     │ API          │ API          │ Queries
     ▼              ▼              ▼
```

---

## Data Flow: Complete Booking Journey

```
╔════════════════════════════════════════════════════════════════════════╗
║                      USER INITIATES BOOKING                            ║
╚════════════════════════════════════════════════════════════════════════╝

     User fills form
     ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                    │
│ BookingSection.tsx                                          │
│ - Validates input (phone, email, date)                      │
│ - Gets services from DB (with fallback)                     │
│   ⚙️ FIXED: Shows error when DB fails                       │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ API CALL: POST /create-booking                              │
│ Payload: {customer_name, phone, email, service_id, ...}     │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ SUPABASE EDGE FUNCTION: create-booking                      │
│                                                             │
│ 1️⃣  Validate input                                          │
│     - Phone format ✓                                         │
│     - Email format ✓                                         │
│     - Location provided (optional)                           │
│                                                             │
│ 2️⃣  Generate short_ref (8-char code)                        │
│                                                             │
│ 3️⃣  Insert into 'bookings' table                            │
│     - Existing service = use price                           │
│     - New service = fallback prices                          │
│                                                             │
│ 4️⃣  Return booking data to frontend                         │
│ {                                                           │
│   success: true,                                            │
│   booking: {                                                │
│     id: "uuid-123",                                         │
│     short_ref: "ABC123XY",                                  │
│     amount: 500,                                            │
│     payment_status: "pending"                               │
│   }                                                         │
│ }                                                           │
│                                                             │
│ 🔄 BACKGROUND (async):                                      │
│    └─→ Call send-booking-telegram                          │
│        └─→ Notify admin on Telegram                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                    │
│ - Show success message                                      │
│ - Display booking reference                                 │
│ - Redirect to track page or show QR code                    │
└─────────────────────────────────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════════╗
║                   ADMIN RECEIVES TELEGRAM NOTIFICATION                 ║
╚════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│ TELEGRAM BOT (Deno Edge Function)                           │
│ send-booking-telegram runs:                                 │
│                                                             │
│ 1️⃣  Get TELEGRAM_BOT_TOKEN from env                         │
│ 2️⃣  Format message with booking details                     │
│     ⚙️ FIXED: UPI ID from env var (not hardcoded)           │
│ 3️⃣  Add inline buttons: "Payment Received" / "Not Received" │
│ 4️⃣  Send to TELEGRAM_CHAT_ID (admin group)                  │
│ 5️⃣  Log to payment_logs table                               │
│                                                             │
│ Message format:                                             │
│ 🔔 *New Repair Booking*                                     │
│ 👤 Name: [customer_name]                                    │
│ 📱 Phone: [phone]                                           │
│ 🛠 Service: [service]                                       │
│ 🆔 Ref: [short_ref]                                         │
│ 💰 Amount: ₹[amount]                                        │
│ 💳 UPI: [upi_id_from_env] ← FIXED!                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ TELEGRAM ADMIN RECEIVES MESSAGE                             │
│ - Sees booking details                                      │
│ - Clicks "✅ Payment Received" button                        │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ TELEGRAM API → WEBHOOK                                      │
│ Sends callback to:                                          │
│ POST /telegram-webhook                                      │
│ {                                                           │
│   callback_query: {                                         │
│     id: "...",                                              │
│     from: {id: 12345},                                      │
│     data: "py:ABC123XY"  ← "py" = payment yes               │
│   }                                                         │
│ }                                                           │
│ Header: x-telegram-bot-api-secret-token: [WEBHOOK_SECRET]   │
│                                                             │
│ ⚙️ FIXED: Strict validation of secret                       │
│           (throws error if not configured)                  │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ SUPABASE EDGE FUNCTION: telegram-webhook                    │
│                                                             │
│ 1️⃣  Verify webhook secret matches                           │
│     ⚙️ FIXED: No bypass if secret missing                    │
│                                                             │
│ 2️⃣  Extract booking ref from callback data                  │
│                                                             │
│ 3️⃣  Update bookings table:                                  │
│     SET payment_status = 'confirmed'                        │
│     WHERE short_ref = 'ABC123XY'                            │
│                                                             │
│ 4️⃣  Send confirmation email                                 │
│     (Call send-booking-email in background)                 │
│                                                             │
│ 5️⃣  Log webhook event to payment_logs                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ SUPABASE EDGE FUNCTION: send-booking-email                  │
│                                                             │
│ 1️⃣  Get BREVO_API_KEY, SENDER_EMAIL from env                │
│     ⚙️ FIXED: Credentials from env (not hardcoded)          │
│                                                             │
│ 2️⃣  Format HTML email:                                      │
│     Subject: "✅ Payment Confirmed - Booking #ABC123XY"    │
│     Body: Styled HTML with booking details                  │
│                                                             │
│ 3️⃣  Call Brevo SMTP API:                                    │
│     POST https://api.brevo.com/v3/smtp/email                │
│     Headers: api-key: [BREVO_API_KEY]                       │
│     {                                                       │
│       sender: { name: "TechnoLogiya", email: [from_env] }   │
│       to: [{email: customer_email}]                         │
│       subject: "..."                                        │
│       htmlContent: "..."                                    │
│     }                                                       │
│                                                             │
│ 4️⃣  Handle errors:                                          │
│     ⚙️ FIXED: Sanitize error messages                        │
│     - Return generic message to client                      │
│     - Log actual error internally                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ BREVO EMAIL SERVICE                                         │
│ - Adds to queue                                             │
│ - Sends via SMTP                                            │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER EMAIL                                              │
│ Receives: "✅ Payment Confirmed - Booking #ABC123XY"       │
│ Contains: Tracking link, repair status                      │
└─────────────────────────────────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════════╗
║                    USER TRACKS BOOKING STATUS                          │
╚════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: /track page                                       │
│ - User enters booking reference: ABC123XY                   │
│ - Clicks "Track"                                            │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ API CALL: GET /get-booking-status?ref=ABC123XY              │
│ Headers: Standard HTTP headers                              │
│ Rate limited: 30 requests per minute per IP                 │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ SUPABASE EDGE FUNCTION: get-booking-status                  │
│                                                             │
│ 1️⃣  Check rate limit (Redis in-memory store)               │
│                                                             │
│ 2️⃣  Query bookings table:                                   │
│     SELECT * FROM bookings                                  │
│     WHERE short_ref = 'ABC123XY'                            │
│                                                             │
│ 3️⃣  Return booking data:                                    │
│     {                                                       │
│       success: true,                                        │
│       booking: {                                            │
│         customer_name: "Ahmed",                             │
│         short_ref: "ABC123XY",                              │
│         payment_status: "confirmed",                        │
│         repair_status: "pending",  (or technician_called,   │
│         created_at: "...",          technician_fixing, etc) │
│         updated_at: "..."                                   │
│       }                                                     │
│     }                                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: /track page                                       │
│ - Display booking details                                   │
│ - Show repair status timeline                               │
│ - Update every 10-30 seconds (auto-refresh)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables Flow

```
┌──────────────┐
│  .env.local  │  ← Your local configuration
└──────┬───────┘
       │
       ├─→ VITE_SUPABASE_URL ──────→ Frontend config
       ├─→ VITE_SUPABASE_KEY ──────→ Frontend auth
       │
       ├─→ TELEGRAM_BOT_TOKEN ────→ Edge functions
       ├─→ TELEGRAM_CHAT_ID ──────→ (admin group ID)
       ├─→ TELEGRAM_WEBHOOK_SECRET ─→ (webhook auth)
       │
       ├─→ BREVO_API_KEY ────→ Email service
       ├─→ SENDER_EMAIL ─────→ (from address)
       │
       ├─→ UPI_ID ────→ Payment details  ← FIXED!
       │
       └─→ SUPABASE_SERVICE_ROLE_KEY → Admin operations
```

---

## Local vs Production Environment

```
┌─────────────────────────────┬─────────────────────────────┐
│ LOCAL (Development)         │ PRODUCTION                  │
├─────────────────────────────┼─────────────────────────────┤
│ Frontend Port: 5173         │ https://app.technologiya... │
│ Backend: localhost:54321    │ https://...supabase.co      │
│ Database: Local Postgres    │ Managed Postgres            │
│ Edge Functions: Local       │ Deployed serverless         │
│                             │                             │
│ Start: `npm run dev`        │ Always running              │
│ Start: `supabase start`     │ Auto-deployed               │
│                             │                             │
│ Data: Test data             │ Real customer data          │
│ Logs: Terminal output       │ Supabase dashboard          │
│ Testing: `node test-web..` │ Monitor analytics           │
│                             │                             │
│ Emails: Logged/Mock         │ Actually sent               │
│ Telegram: Direct            │ Direct to Telegram API      │
│ Webhooks: NGrok tunnel      │ Public URLs                 │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘
```

---

## Testing Architecture

```
┌─────────────────────────────────────────────────────────┐
│ TEST SUITE: test-webhooks.js                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Uses: Axios HTTP client + dotenv configuration         │
│                                                         │
│ Tests:                                                  │
│  1. Create booking ✓                                    │
│  2. Get booking status ✓                                │
│  3. Send Telegram ✓                                     │
│  4. Send email ✓                                        │
│  5. CORS headers ✓                                      │
│  6. Error handling ✓                                    │
│  7. Rate limiting ✓                                     │
│                                                         │
│ Output: Color-coded results with pass/fail counts      │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │ Reads                   │ Makes requests to
         ▼                         ▼
     .env.local          Supabase Edge Functions
                              │
                         Returns JSON
                              │
                         Validates response
                              │
                    Pass/Fail logged to console
```

---

## Webhook Security Flow

```
┌─────────────────────────┐
│ Telegram Sends Update   │
│ {update_id, ...}        │
│ + Header:               │
│ x-telegram-bot-api-     │
│   secret-token: SECRET  │
└────────────┬────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│ Supabase telegram-webhook Function               │
│                                                  │
│ 1. Read header: x-telegram-bot-api-secret-token │
│                                                  │
│ 2. Get env var: TELEGRAM_WEBHOOK_SECRET          │
│    ⚙️ FIXED: Must exist, no fallback             │
│                                                  │
│ 3. Compare:                                      │
│    if header_value !== env_value:                │
│      throw new Error("Unauthorized")             │
│    else:                                         │
│      Process webhook                            │
│                                                  │
│ 4. Result:                                       │
│    ✓ Only Telegram can trigger updates          │
│    ✓ Attackers can't impersonate webhook        │
│    ✗ Missing secret = function disabled         │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Performance & Scalability

```
Component              | Capacity        | Limit
─────────────────────────────────────────────────────
Create Booking         | ~100 req/sec    | No explicit limit
Get Booking Status     | 30/min per IP   | Rate limited
Telegram Messages      | ~10/sec         | Telegram API limits
Emails                 | ~10/sec         | Brevo plan limits
Database               | ~1000 connections | Supabase limits
Edge Functions         | Stateless       | Auto-scale
Concurrent Users       | Supabase tier   | Depends on plan

For 1000+ users:
- ✓ Upgrade Supabase plan (increase connections)
- ✓ Add caching layer (Redis)
- ✓ Implement request batching
```

---

## Debugging the Data Flow

```
Problem: "My booking isn't in the database"

Debug flow:
1. Check frontend console errors
   ↓
2. Check Supabase logs (supabase start terminal)
   ↓
3. Query database directly:
   psql ... -c "SELECT * FROM bookings LIMIT 5;"
   ↓
4. Check payment_logs for errors:
   psql ... -c "SELECT * FROM payment_logs LIMIT 10;"
   ↓
5. Verify edge function ran:
   Look for "Booking created" log in Supabase
   ↓
6. Check network tab (F12):
   See actual request/response


Problem: "Telegram message not sent"

Debug flow:
1. Check Supabase logs for send-booking-telegram errors
   ↓
2. Verify credentials in .env.local:
   TELEGRAM_BOT_TOKEN valid?
   TELEGRAM_CHAT_ID correct?
   ↓
3. Test bot directly:
   curl https://api.telegram.org/bot<TOKEN>/getMe
   ↓
4. Check if bot is added to chat
   ↓
5. Look for Telegram API errors in logs


Problem: "Email not received"

Debug flow:
1. Check Supabase logs for send-booking-email errors
   ↓
2. Verify Brevo credentials:
   BREVO_API_KEY valid?
   SENDER_EMAIL registered in Brevo?
   ↓
3. Check Brevo API directly:
   curl https://api.brevo.com/v3/account -H "api-key: KEY"
   ↓
4. Check email spam folder
   ↓
5. Review Brevo dashboard for delivery status
```

This architecture is designed to be:
- **Modular**: Each function is independent
- **Scalable**: Serverless edge functions
- **Reliable**: Database transactions + logging
- **Secure**: Environment variable protection ✅
- **Testable**: Automated test suite included
