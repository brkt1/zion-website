#!/usr/bin/env node

/**
 * Test script to directly test Chapa payment initialization
 * Usage: node test-payment-init.js
 */

require('dotenv').config();
const { Chapa } = require('chapa-nodejs');

const secretKey = process.env.CHAPA_SECRET_KEY;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('🧪 Testing Chapa Payment Initialization...\n');

if (!secretKey) {
  console.error('❌ ERROR: CHAPA_SECRET_KEY is not set!');
  process.exit(1);
}

const chapa = new Chapa({
  secretKey: secretKey,
});

// Test payment data
const baseUrl = frontendUrl.replace(/\/$/, '');
const txRef = 'TEST-' + Date.now();
const callbackUrl = `${baseUrl}/payment/callback`;
const returnUrl = `${baseUrl}/payment/success?tx_ref=${txRef}`;

const paymentData = {
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  phone_number: '0911121314',
  currency: 'ETB',
  amount: '100',
  tx_ref: txRef,
  callback_url: callbackUrl,
  return_url: returnUrl,
  customization: {
    title: 'Test Payment',
    description: 'Testing payment initialization',
  },
};

console.log('📋 Payment Data:');
console.log(JSON.stringify(paymentData, null, 2));
console.log('\n🚀 Calling Chapa initialize...\n');

chapa.initialize(paymentData)
  .then((response) => {
    console.log('✅ SUCCESS! Payment initialized!');
    console.log('\nResponse:');
    console.log(JSON.stringify(response, null, 2));
    console.log('\n✅ Checkout URL:', response.data?.checkout_url);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ ERROR: Payment initialization failed!\n');
    
    // Try to extract all possible error information
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message || 'No message');
    console.error('Error Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
    
    if (error.response) {
      console.error('\n📋 HTTP Response Details:');
      console.error('  Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      console.error('  Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.request) {
      console.error('\n📋 Request Details:');
      console.error('  Request made but no response received');
    }
    
    // Try to get the actual error data - Chapa library might store it differently
    console.error('\n📋 All Error Properties:');
    for (const key in error) {
      if (error.hasOwnProperty(key)) {
        try {
          const value = error[key];
          if (typeof value === 'object' && value !== null) {
            console.error(`  ${key}:`, JSON.stringify(value, null, 2));
          } else {
            console.error(`  ${key}:`, value);
          }
        } catch (e) {
          console.error(`  ${key}: [Cannot stringify]`);
        }
      }
    }
    
    // Check nested properties
    if (error.response) {
      console.error('\n📋 Response Object Properties:');
      for (const key in error.response) {
        console.error(`  response.${key}:`, error.response[key]);
      }
    }
    
    // Try to access the actual Chapa error
    const chapaError = error.response?.data || error.data || error.body || error;
    console.error('\n📋 Chapa Error Data:');
    console.error(JSON.stringify(chapaError, null, 2));
    
    // Check common Chapa error fields
    if (chapaError.message && chapaError.message !== '[object Object]') {
      console.error('\n💡 Chapa Error Message:', chapaError.message);
    }
    if (chapaError.error) {
      console.error('💡 Chapa Error Code:', chapaError.error);
    }
    if (chapaError.status) {
      console.error('💡 HTTP Status:', chapaError.status);
    }
    
    process.exit(1);
  });

