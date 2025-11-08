#!/usr/bin/env node

/**
 * Direct HTTP test to Chapa API to see actual error response
 */

require('dotenv').config();
const https = require('https');

const secretKey = process.env.CHAPA_SECRET_KEY;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

if (!secretKey) {
  console.error('❌ CHAPA_SECRET_KEY not set!');
  process.exit(1);
}

const baseUrl = frontendUrl.replace(/\/$/, '');
const txRef = 'TEST-' + Date.now();

const paymentData = {
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  phone_number: '0911121314',
  currency: 'ETB',
  amount: '100',
  tx_ref: txRef,
  callback_url: `${baseUrl}/payment/callback`,
  return_url: `${baseUrl}/payment/success?tx_ref=${txRef}`,
  customization: {
    title: 'Test Payment',
    description: 'Testing payment initialization',
  },
};

const postData = JSON.stringify(paymentData);

const options = {
  hostname: 'api.chapa.co',
  port: 443,
  path: '/v1/transaction/initialize',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log('🧪 Making direct HTTP request to Chapa API...\n');
console.log('URL: https://api.chapa.co/v1/transaction/initialize');
console.log('Headers:', {
  'Authorization': `Bearer ${secretKey.substring(0, 20)}...`,
  'Content-Type': 'application/json',
});
console.log('\nRequest Body:');
console.log(JSON.stringify(paymentData, null, 2));
console.log('\n⏳ Sending request...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 Chapa API Response:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('HTTP Status:', res.statusCode);
    console.log('Status Message:', res.statusMessage);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    console.log('\nResponse Body:');
    
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ SUCCESS!');
        if (jsonData.data?.checkout_url) {
          console.log('Checkout URL:', jsonData.data.checkout_url);
        }
      } else {
        console.log('\n❌ ERROR Response from Chapa:');
        if (jsonData.message) {
          console.log('  Message:', jsonData.message);
        }
        if (jsonData.error) {
          console.log('  Error:', jsonData.error);
        }
        if (jsonData.errors) {
          console.log('  Errors:', JSON.stringify(jsonData.errors, null, 2));
        }
      }
    } catch (e) {
      console.log('Raw response (not JSON):', data);
    }
    
    console.log('═══════════════════════════════════════════════════════');
    process.exit(res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();

