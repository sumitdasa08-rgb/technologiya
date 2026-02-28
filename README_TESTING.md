# 📚 Technologiya Documentation Index

## 🚀 Getting Started (Start Here!)

| Document | Purpose | Time | Audience |
|----------|---------|------|----------|
| **[QUICK_START.md](QUICK_START.md)** | Get running in 5 minutes | ⏱️ 5 min | Everyone - Start here! |
| **[LOCAL_SETUP.md](LOCAL_SETUP.md)** | Detailed setup instructions | ⏱️ 30 min | Comprehensive setup |
| **[DEBUGGING.md](DEBUGGING.md)** | Troubleshooting & debugging | ⏱️ 15 min | When things break |

---

## 📋 What's Included

### Configuration Files
- **`.env.local`** - Environment variables for development
  - Telegram credentials
  - Email service credentials
  - Webhook secrets
  - Local Supabase URL configuration

### Testing Files

#### 1. **`test_apis.http`** - API Testing with REST Client
- 🎯 **Best for:** Manual API testing
- 📦 **Requires:** VS Code REST Client extension
- 🔧 **Using:** Copy-paste ready HTTP requests
- ✅ **Tests included:**
  - Create booking
  - Get booking status
  - Send Telegram notifications
  - Send emails
  - Webhook handling
  - CORS testing
  - Error handling
  - Rate limiting

#### 2. **`test-webhooks.js`** - Automated Testing Script
- 🎯 **Best for:** Automated health checks
- 📦 **Requires:** Node.js
- 🔧 **Using:** `node test-webhooks.js`
- ✅ **Tests included:**
  - All API endpoints
  - Configuration validation
  - Error handling
  - Pass/fail summary

---

## 🔍 Quick Reference by Task

### "I want to start developing locally"
👉 Read: [QUICK_START.md](QUICK_START.md)
```bash
npm install
npm run dev           # Frontend
supabase start        # Backend (new terminal)
node test-webhooks.js # Verify everything works
```

### "I want detailed setup instructions"
👉 Read: [LOCAL_SETUP.md](LOCAL_SETUP.md)
- Frontend setup
- Supabase local configuration
- Edge function testing
- Telegram webhook setup
- Complete integration flow
- Deployment steps

### "Something's broken, how do I debug?"
👉 Read: [DEBUGGING.md](DEBUGGING.md)
- Webhook testing procedures
- Performance testing
- Rate limiting checks
- Database inspection queries
- Common error patterns
- Health check script

### "I want to test specific API endpoints"
👉 Use: [test_apis.http](test_apis.http)
1. Install REST Client extension in VS Code
2. Open `test_apis.http`
3. Choose your environment (local/production)
4. Click "Send Request" on any test
5. View response in sidebar

### "I want automated testing"
👉 Run: `node test-webhooks.js`
```bash
npm install axios dotenv
node test-webhooks.js
```

---

## 📂 File Structure

```
d:\Technologiya\technologiya\
├── 📄 QUICK_START.md          ← Start here (5 min)
├── 📄 LOCAL_SETUP.md          ← Detailed setup (30 min)
├── 📄 DEBUGGING.md            ← Troubleshooting guide
├── 📄 README.md               ← This file
├── 📋 test_apis.http          ← HTTP requests for testing
├── 🔧 test-webhooks.js        ← Automated test script
├── 🔐 .env.local              ← Environment variables
│
├── src/                       ← Frontend code
│   ├── components/
│   │   ├── BookingSection.tsx (FIXED: servicesLoadError)
│   │   └── UpdatePrompt.tsx   (FIXED: promise rejection)
│   └── ...
│
├── supabase/
│   ├── functions/
│   │   ├── create-booking/
│   │   ├── get-booking-status/
│   │   ├── send-booking-email/      (FIXED: credentials, errors)
│   │   ├── send-booking-telegram/   (FIXED: credentials)
│   │   ├── telegram-webhook/        (FIXED: auth bypass)
│   │   └── ...
│   └── migrations/                  ← Database schemas
│
└── package.json
```

---

## 🛠️ Tools You'll Need

| Tool | Purpose | Installation |
|------|---------|--------------|
| Node.js | JavaScript runtime | https://nodejs.org |
| Git | Version control | https://git-scm.com |
| Supabase CLI | Local backend | `npm install -g supabase` |
| VS Code REST Client | API testing | VS Code extension (optional) |
| NGrok | Webhook tunneling | `npm install -g ngrok` (optional) |
| Postman/Insomnia | API client | https://postman.com (optional) |

---

## 🔗 External Resources

### Supabase
- [Local Development](https://supabase.com/docs/guides/local-development)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Postgres Guide](https://supabase.com/docs/guides/database)

### Telegram Bot API
- [Getting Started](https://core.telegram.org/bots/api)
- [BotFather Guide](https://core.telegram.org/bots/features#botfather)
- [Webhooks](https://core.telegram.org/bots/api#setwebhook)

### Brevo Email API
- [API Docs](https://developers.brevo.com/docs/getting-started)
- [SMTP Guide](https://brevo.com/help/)
- [Email Templates](https://app.brevo.com/templates)

### Development Tools
- [REST Client Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [NGrok Documentation](https://ngrok.com/docs)
- [Postman Learning Center](https://learning.postman.com/)

---

## ✅ Fixed Issues Summary

### 6 Critical Issues Fixed

1. **✅ UpdatePrompt.tsx:8** - Unhandled Promise Rejection
   - Added `.catch()` handlers for cache deletion

2. **✅ BookingSection.tsx:135** - servicesLoadError Logic Error
   - Changed `false` to `true` in catch block

3. **✅ send-booking-email** - Exposed Email Credential
   - Moved hardcoded email to `SENDER_EMAIL` env var

4. **✅ send-booking-telegram** - Exposed UPI ID
   - Moved hardcoded UPI to `UPI_ID` env var

5. **✅ telegram-webhook** - Authorization Bypass
   - Now rejects requests if webhook secret not configured

6. **✅ send-booking-email** - Error Message Leakage
   - Added error message sanitization

---

## 🎯 Testing Workflow

### Daily Development
```bash
# Terminal 1: Frontend
npm run dev
# Visit http://localhost:5173

# Terminal 2: Backend
supabase start
# Edge functions run on localhost:54321

# Terminal 3: Testing
node test-webhooks.js
# Verify all components work
```

### Manual Testing
1. Open `test_apis.http` in VS Code
2. Change `@baseUrl` to your environment
3. Send requests and check responses

### Integration Testing
1. Fill booking form on frontend
2. Submit form (calls create-booking)
3. Receive Telegram notification (simulated)
4. Click status on /track page (calls get-booking-status)
5. Receive email confirmation (simulated)

---

## 📝 Common Commands

```bash
# Install dependencies
npm install

# Start frontend development
npm run dev

# Start backend locally
supabase start

# Run all tests
node test-webhooks.js

# View Supabase functions
supabase functions list

# Deploy to production
supabase deploy

# Connect to local database
psql postgresql://postgres:postgres@localhost:5432/postgres

# Generate webhook secret
openssl rand -hex 16

# Setup Telegram webhooks
ngrok http 54321
# Note the URL, use in test_apis.http

# Lint code
npm run lint

# Build for production
npm run build
```

---

## 🆘 Getting Help

### Step 1: Check the Right Document
- Setup issue? → **LOCAL_SETUP.md**
- Error message? → **DEBUGGING.md**
- Want to test API? → Read **test_apis.http** instructions
- Just starting? → **QUICK_START.md**

### Step 2: Run Diagnostics
```bash
node test-webhooks.js
```
This tells you exactly what's working and what's not.

### Step 3: Check Logs
```bash
# Frontend logs: Check browser console (F12)
# Backend logs: Watch supabase start terminal
# Database: psql postgresql://postgres:postgres@localhost:5432/postgres
```

### Step 4: Verify Configuration
```bash
# Check environment variables
cat .env.local | grep -E "TELEGRAM|BREVO|UPI"

# Verify credentials are valid
# - TELEGRAM_BOT_TOKEN: Send /start to @BotFather
# - BREVO_API_KEY: Copy from Brevo dashboard
```

---

## 📊 Status Tracking

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend | ✅ Running | Started with `npm run dev` |
| Backend API | ✅ Running | Started with `supabase start` |
| Telegram | ✅ Configured | Requires `.env.local` setup |
| Email | ✅ Configured | Requires Brevo API key |
| Webhooks | ✅ Working | Tested with test_apis.http |
| Database | ✅ Connected | Local Postgres |
| Tests | ✅ Automated | Run with `node test-webhooks.js` |

---

## 🎓 Learning Path

**Beginner:**
1. Read QUICK_START.md (5 min)
2. Run `npm run dev` (frontend)
3. Run `supabase start` (backend)
4. Test with `node test-webhooks.js`

**Intermediate:**
1. Read LOCAL_SETUP.md (30 min)
2. Test individual components with test_apis.http
3. Make code changes and see live updates
4. Check logs when things break

**Advanced:**
1. Deep dive with DEBUGGING.md
2. Inspect database directly
3. Monitor network traffic
4. Profile performance
5. Deploy to production

---

## 💡 Pro Tips

1. **Keep terminals open:** Frontend (5173), Supabase (54321), Testing scripts
2. **Watch the logs:** `supabase start` terminal shows all function errors
3. **Use REST Client:** Much faster than Postman for quick testing
4. **Save test bookings:** Use booking refs to test tracking page
5. **Check credentials first:** 90% of issues are missing env vars
6. **Use ngrok for webhooks:** Essential for testing Telegram callbacks
7. **Database is your friend:** `psql` commands in DEBUGGING.md are lifesavers

---

## 📞 Quick Support

| Issue | Solution |
|-------|----------|
| Port already in use | Change port: `npm run dev -- --port 3000` |
| Supabase won't start | `supabase reset` then `supabase start` |
| API returns 404 | Check function names, ensure `supabase start` running |
| Telegram not working | Verify bot token, chat ID, webhook secret in `.env.local` |
| Email not sending | Confirm Brevo API key, sender email verified |
| Database empty | Run migrations: See LOCAL_SETUP.md Part 2 Step 3 |

---

## 🚀 Ready to Get Started?

**Next Steps:**
1. Open [QUICK_START.md](QUICK_START.md)
2. Follow the 5-minute setup
3. Run `node test-webhooks.js`
4. Start developing!

**Happy coding!** 🎉
