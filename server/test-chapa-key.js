#!/usr/bin/env node

/**
 * Simple script to test if Chapa API key is valid
 * Usage: node test-chapa-key.js
 */

require('dotenv').config();
const { Chapa } = require('chapa-nodejs');

const secretKey = process.env.CHAPA_SECRET_KEY;

console.log('🔍 Testing Chapa API Key...\n');

if (!secretKey) {
  console.error('❌ ERROR: CHAPA_SECRET_KEY is not set in .env file!');
  console.log('\nPlease add your Chapa API key to server/.env:');
  console.log('CHAPA_SECRET_KEY=CHASECK_TEST-your-key-here\n');
  process.exit(1);
}

if (!secretKey.startsWith('CHASECK_')) {
  console.error('❌ ERROR: API key does not start with CHASECK_');
  console.log('Your key:', secretKey.substring(0, 20) + '...');
  console.log('\nPlease verify you copied the correct key from Chapa dashboard.\n');
  process.exit(1);
}

console.log('✅ API Key format looks correct');
console.log('   Key prefix:', secretKey.substring(0, 20) + '...\n');

const chapa = new Chapa({
  secretKey: secretKey,
});

// Try to generate a transaction reference (lightweight test)
console.log('🧪 Testing API key with Chapa...\n');

chapa.generateTransactionReference({
  prefix: 'TEST',
  size: 10,
})
  .then((txRef) => {
    console.log('✅ SUCCESS! API key is valid and working!');
    console.log('   Generated test transaction reference:', txRef);
    console.log('\nYour Chapa integration should work correctly.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ ERROR: API key validation failed!\n');
    console.error('Error message:', error.message);
    
    if (error.response?.data) {
      console.error('Chapa response:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.error('\nPossible issues:');
    console.error('1. The API key is incorrect or expired');
    console.error('2. Your Chapa account is not active');
    console.error('3. Your Chapa account cannot accept payments');
    console.error('4. The API key format is wrong\n');
    
    console.log('Solutions:');
    console.log('1. Go to https://dashboard.chapa.co');
    console.log('2. Verify your account is active and verified');
    console.log('3. Get a new test API key from Settings → API Keys');
    console.log('4. Update CHAPA_SECRET_KEY in server/.env');
    console.log('5. Restart your backend server\n');
    
    process.exit(1);
  });

