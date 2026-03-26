const crypto = require('crypto');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const stripe_webhook_secret = process.env.STRIPE_WEBHOOK_SECRET;
const port = process.env.PORT || 5000;

// From the user's report
const paymentIntentId = 'pi_3TCBID0FGNXlRHOf0EIbNn8G';
// A valid user from debug output: "Rahul" was 69aff9eee70ff9a54e5d8495
const userId = '69aff9eee70ff9a54e5d8495'; 

const event = {
  id: 'evt_test_' + Date.now(),
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: paymentIntentId,
      amount: 50000, // ₹500
      metadata: {
        userId: userId,
        type: 'wallet_topup'
      }
    }
  }
};

const payload = JSON.stringify(event);
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto
  .createHmac('sha256', stripe_webhook_secret)
  .update(signedPayload)
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

const options = {
  hostname: 'localhost',
  port: port,
  path: '/api/payments/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': stripeSignature,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  process.exit(1);
});

req.write(payload);
req.end();
