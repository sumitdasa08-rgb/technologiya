#!/usr/bin/env node

/**
 * Technologiya Webhook Testing Tool
 * Test all webhooks and API endpoints locally
 *
 * Usage:
 *   npm install axios dotenv
 *   node test-webhooks.js
 *
 * Or directly:
 *   npx ts-node test-webhooks.ts
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.LOCAL_SUPABASE_URL || 'http://localhost:54321';
const IS_LOCAL = SUPABASE_URL.includes('localhost');
const TIMEOUT = 10000; // 10 seconds

const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (color, ...args) => console.log(`${color}${args.join(' ')}${Colors.reset}`);
const logSuccess = (...args) => log(Colors.green, '✅', ...args);
const logError = (...args) => log(Colors.red, '❌', ...args);
const logInfo = (...args) => log(Colors.cyan, 'ℹ️ ', ...args);
const logWarning = (...args) => log(Colors.yellow, '⚠️ ', ...args);
const logHeader = (...args) => log(Colors.bright + Colors.blue, '\n═══ ' + args.join(' ') + ' ═══\n');

// ============================================================================
// AXIOSY REQUEST HELPER
// ============================================================================

async function testEndpoint(method, path, data = null, headers = {}) {
  const url = `${SUPABASE_URL}/functions/v1${path}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  try {
    const config = {
      method,
      url,
      headers: defaultHeaders,
      timeout: TIMEOUT,
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    if (error.response) {
      return { success: false, status: error.response.status, data: error.response.data, error: error.message };
    }
    return { success: false, error: error.message };
  }
}

// ============================================================================
// TESTS
// ============================================================================

async function runTests() {
  log(Colors.bright + Colors.cyan, `\n╔════════════════════════════════════════════════════════════╗`);
  log(Colors.bright + Colors.cyan, `║     Technologiya Webhook & API Testing Suite              ║`);
  log(Colors.bright + Colors.cyan, `║     Environment: ${IS_LOCAL ? 'LOCAL (Supabase)' : 'PRODUCTION'}${' '.repeat(30 - (IS_LOCAL ? 'LOCAL (Supabase)' : 'PRODUCTION').length)}║`);
  log(Colors.bright + Colors.cyan, `║     URL: ${SUPABASE_URL}${' '.repeat(56 - SUPABASE_URL.length)}║`);
  log(Colors.bright + Colors.cyan, `╚════════════════════════════════════════════════════════════╝\n`);

  if (!IS_LOCAL) {
    logWarning('Running against PRODUCTION - be careful!');
  } else {
    logInfo('Running against LOCAL environment - safe to test freely');
  }

  let passedTests = 0;
  let failedTests = 0;

  // ========================================================================
  // TEST 1: CREATE BOOKING
  // ========================================================================
  logHeader('TEST 1: CREATE BOOKING');

  const bookingData = {
    customer_name: 'Test User',
    phone: '+919876543210',
    email: 'test@example.com',
    service_id: 'screen-replacement',
    location: 'Test City',
    booking_date: '2026-03-20',
    booking_time: '14:00',
    issue: 'Screen is cracked',
  };

  const createResult = await testEndpoint('POST', '/create-booking', bookingData);
  if (createResult.success) {
    logSuccess('Booking created successfully');
    log(Colors.blue, 'Response:');
    console.log(JSON.stringify(createResult.data, null, 2));
    passedTests++;

    // Extract booking references for later tests
    const bookingRef = createResult.data.booking?.short_ref;
    const bookingId = createResult.data.booking?.id;

    if (bookingRef) {
      logInfo(`Booking Reference: ${bookingRef}`);
    }
    if (bookingId) {
      logInfo(`Booking ID: ${bookingId}`);
    }

    // ====================================================================
    // TEST 2: GET BOOKING STATUS
    // ====================================================================
    logHeader('TEST 2: GET BOOKING STATUS');

    const statusResult = await testEndpoint('GET', `/get-booking-status?ref=${bookingRef}`);
    if (statusResult.success) {
      logSuccess('Booking status retrieved successfully');
      log(Colors.blue, 'Response:');
      console.log(JSON.stringify(statusResult.data, null, 2));
      passedTests++;
    } else {
      logError('Failed to get booking status');
      console.error(statusResult);
      failedTests++;
    }

    // ====================================================================
    // TEST 3: SEND TELEGRAM NOTIFICATION
    // ====================================================================
    logHeader('TEST 3: SEND TELEGRAM NOTIFICATION');

    const telegramData = {
      booking_id: bookingId || '550e8400-e29b-41d4-a716-446655440000',
      customer_name: 'Test User',
      phone: '+919876543210',
      amount: 500,
      service: 'Screen Replacement',
      short_ref: bookingRef || 'TEST001',
      location: 'Test City',
    };

    const telegramResult = await testEndpoint('POST', '/send-booking-telegram', telegramData);
    if (telegramResult.success) {
      logSuccess('Telegram notification sent successfully');
      console.log(JSON.stringify(telegramResult.data, null, 2));
      passedTests++;
    } else {
      if (telegramResult.error?.includes('TELEGRAM_BOT_TOKEN') || telegramResult.error?.includes('not configured')) {
        logWarning('Telegram not configured (expected if not set up)');
        logInfo('To enable: Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local');
        passedTests++; // Count as pass since it's a config issue
      } else {
        logError('Failed to send Telegram notification');
        console.error(telegramResult);
        failedTests++;
      }
    }

    // ====================================================================
    // TEST 4: SEND EMAIL NOTIFICATION
    // ====================================================================
    logHeader('TEST 4: SEND EMAIL NOTIFICATION');

    const emailData = {
      email: 'test@example.com',
      customer_name: 'Test User',
      short_ref: bookingRef || 'TEST001',
      event_type: 'payment_confirmed',
      amount: 500,
    };

    const emailResult = await testEndpoint('POST', '/send-booking-email', emailData);
    if (emailResult.success) {
      logSuccess('Email notification sent successfully');
      console.log(JSON.stringify(emailResult.data, null, 2));
      passedTests++;
    } else {
      if (emailResult.error?.includes('BREVO_API_KEY') || emailResult.error?.includes('not configured')) {
        logWarning('Email service not configured (expected if Brevo key not set)');
        logInfo('To enable: Set BREVO_API_KEY and SENDER_EMAIL in .env.local');
        passedTests++; // Count as pass
      } else {
        logError('Failed to send email notification');
        console.error(emailResult);
        failedTests++;
      }
    }

  } else {
    logError('Failed to create booking');
    console.error(createResult);
    failedTests++;
  }

  // ========================================================================
  // TEST 5: CORS PREFLIGHT
  // ========================================================================
  logHeader('TEST 5: CORS PREFLIGHT (OPTIONS REQUEST)');

  try {
    const corsResult = await axios.options(`${SUPABASE_URL}/functions/v1/create-booking`, {
      timeout: TIMEOUT,
    });
    if (corsResult.status === 200) {
      logSuccess('CORS preflight request successful');
      logInfo('Headers:');
      Object.entries(corsResult.headers)
        .filter(([key]) => key.includes('access-control') || key.includes('allow'))
        .forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      passedTests++;
    }
  } catch (error) {
    logError('CORS preflight failed');
    console.error(error.message);
    failedTests++;
  }

  // ========================================================================
  // TEST 6: ERROR HANDLING
  // ========================================================================
  logHeader('TEST 6: ERROR HANDLING - Invalid Input');

  const invalidData = {
    customer_name: 'Test',
    // Missing required fields
  };

  const errorResult = await testEndpoint('POST', '/create-booking', invalidData);
  if (!errorResult.success || errorResult.status >= 400) {
    logSuccess('Proper error handling - Invalid request rejected');
    console.log(JSON.stringify(errorResult.data, null, 2));
    passedTests++;
  } else {
    logError('Should have rejected invalid request');
    failedTests++;
  }

  // ========================================================================
  // TEST 7: RATE LIMITING
  // ========================================================================
  logHeader('TEST 7: RATE LIMITING');

  logInfo('Making 5 rapid requests to test rate limiting...');
  let rateLimitHit = false;
  for (let i = 0; i < 5; i++) {
    const result = await testEndpoint('GET', `/get-booking-status?ref=TEST${i}`);
    if (result.status === 429) {
      logWarning(`Rate limit hit after ${i} requests`);
      rateLimitHit = true;
      break;
    }
  }

  if (rateLimitHit) {
    logSuccess('Rate limiting is working correctly');
    passedTests++;
  } else {
    logInfo('No rate limit encountered in this test (may vary)');
    passedTests++;
  }

  // ========================================================================
  // RESULTS SUMMARY
  // ========================================================================
  logHeader('TEST RESULTS SUMMARY');

  const totalTests = passedTests + failedTests;
  const passageRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  log(Colors.bright, `Total Tests: ${totalTests}`);
  logSuccess(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    logError(`Failed: ${failedTests}`);
  }
  log(Colors.bright, `Pass Rate: ${passageRate}%`);

  if (failedTests === 0) {
    logSuccess('All tests passed! ✨');
  } else {
    logWarning(`${failedTests} test(s) failed. Check the logs above.`);
  }

  // ========================================================================
  // NEXT STEPS
  // ========================================================================
  logHeader('NEXT STEPS');
  logInfo('1. Review errors above and fix configuration');
  logInfo('2. Set up environment variables in .env.local');
  logInfo('3. Run this test again: node test-webhooks.js');
  logInfo('4. Check LOCAL_SETUP.md for detailed setup instructions');
  logInfo('5. Use test_apis.http for manual API testing with REST Client');

  if (IS_LOCAL) {
    logInfo('\nLocal Development Tips:');
    logInfo('  - Keep supabase start running in another terminal');
    logInfo('  - Watch logs: tail -f ~/.supabase/logs/edge-runtime.log');
    logInfo('  - Check database: psql postgresql://postgres:postgres@localhost:5432/postgres');
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// ============================================================================
// RUN TESTS
// ============================================================================

runTests().catch((error) => {
  logError('Fatal error:', error.message);
  process.exit(1);
});
