# 🚀 Quick Start - Local Development in 5 Minutes

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js v18+ installed
- [ ] Git installed
- [ ] Supabase CLI installed: `npm install -g supabase`
- [ ] (Optional) NGrok for testing Telegram: `npm install -g ngrok`

---

## Step 1: Install Frontend Dependencies (1 min)

```bash
cd d:\Technologiya\technologiya
npm install
```

---

## Step 2: Configure Environment Variables (2 min)

Open `.env.local` and update these:

```env
# ✅ Already configured (from production):
VITE_SUPABASE_URL=https://ryehkycxyhdpufigcotc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...

# ❌ You need to add these:
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=your_admin_group_chat_id
TELEGRAM_WEBHOOK_SECRET=generate_a_random_32_char_secret
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_verified_email_in_brevo
UPI_ID=your_upi_id@bank
```

**How to get these credentials:**
- **TELEGRAM_BOT_TOKEN** → Talk to @BotFather on Telegram, create a new bot, copy token
- **TELEGRAM_CHAT_ID** → Send a message to your bot, then check: `curl https://api.telegram.org/bot<TOKEN>/getUpdates`
- **WEBHOOK_SECRET** → Generate random: `openssl rand -hex 16`
- **BREVO_API_KEY** → Get from https://app.brevo.com/settings/keys/api (Master in/out)
- **SENDER_EMAIL** → Use a verified email address in Brevo
- **UPI_ID** → Your actual UPI ID

---

## Step 3: Start Frontend (30 sec)

```bash
npm run dev
```

Visit: **http://localhost:5173** ✅

See the booking form? Great! Let's test the backend now.

---

## Step 4: Start Supabase Locally (1 min)

Open a **new terminal** in the project folder:

```bash
supabase start
```

Wait for this output:
```
API URL: http://localhost:54321
```

---

## Step 5: Run Full Test Suite (30 sec)

Open another **new terminal**:

```bash
npm install axios dotenv  # (only first time)
node test-webhooks.js
```

This will:
- ✅ Test create booking
- ✅ Test get booking status
- ✅ Test Telegram notification
- ✅ Test email notification
- ✅ Test CORS headers
- ✅ Test error handling
- ✅ Test rate limiting

---

## Step 6: Manual API Testing (Optional)

Install VS Code **REST Client** extension, then open `test_apis.http`:
- Change `@baseUrl` to the environment you want to test
- Click "Send Request" on any test
- See the response in the right panel

---

## Testing Checklist

After starting all services (frontend + supabase), verify:

### Frontend Tests
- [ ] http://localhost:5173 loads
- [ ] Can fill booking form
- [ ] Form submission works
- [ ] See "Booking created" message
- [ ] Can track booking on /track page

### Backend Tests (supabase start running)
```bash
node test-webhooks.js
```
- [ ] All tests pass (green ✅)
- [ ] See error output if any credential missing

### Telegram Tests
1. Set up Telegram credentials in `.env.local`
2. Create a private Telegram group
3. Add your bot to the group
4. In `test_apis.http`, send the Telegram test request
5. Check if message arrives in the group

### Email Tests
1. Set up Brevo credentials
2. In `test_apis.http`, send an email test request
3. Check your inbox (check spam too)

---

## Common Issues

### ❌ "Module not found: axios"
```bash
npm install axios dotenv
```

### ❌ "Supabase command not found"
```bash
npm install -g supabase
```

### ❌ Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### ❌ Port 54321 already in use
```bash
supabase start --port 55321
```

### ❌ Telegram message not sending
- Check `TELEGRAM_BOT_TOKEN` is correct
- Verify bot is added to your group
- Check `TELEGRAM_CHAT_ID` is the group ID (not bot ID)
- Look at `supabase start` logs for errors

### ❌ Email not sending
- Verify `BREVO_API_KEY` is correct
- Ensure `SENDER_EMAIL` is verified in Brevo
- Check error logs in `supabase start` output

---

## Full Integration Test (5-10 min)

✅ **Simulate a real user booking:**

1. Go to http://localhost:5173
2. Fill the booking form with test data
3. Click "Book Now"
4. See "Booking created!" message
5. Copy the booking reference (e.g., ABC123XY)
6. Go to http://localhost:5173/track
7. Paste the reference and check status
8. Go to Telegram group → should see the payment request
9. Click "✅ Payment Received" in Telegram
10. Check email inbox → confirmation email arrives

If all steps work, your system is fully functional! 🎉

---

## Continuous Testing

While developing, keep these running:

**Terminal 1:**
```bash
npm run dev
```
Frontend auto-reloads on code changes

**Terminal 2:**
```bash
supabase start
```
Keep running for backend access

**Terminal 3 (when needed):**
```bash
node test-webhooks.js
```
Quick health check

---

## Advanced Testing

For more detailed testing, see **LOCAL_SETUP.md** which covers:
- Detailed setup instructions
- Testing each component separately
- Debugging techniques
- Database inspection
- Production deployment verification

---

## Need Help?

1. Check LOCAL_SETUP.md for detailed instructions
2. Review test_apis.http for API examples
3. Check supabase start terminal for error logs
4. Ensure all environment variables are set correctly

**Still stuck?** The test-webhooks.js tool will tell you exactly what's missing!

---

**Ready?** Start with Step 1! 🚀
