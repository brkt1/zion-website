// Simple test script for the score endpoints
// Run with: node test_endpoints.js

const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3001';

async function testEndpoints() {
  console.log('Testing Score API Endpoints...\n');
  
  // Test 1: Simple test endpoint
  console.log('1. Testing /api/scores/test');
  try {
    const response = await fetch(`${baseUrl}/api/scores/test`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log('   Response:', data);
  } catch (error) {
    console.error('   Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Schema debug endpoint
  console.log('2. Testing /api/scores/debug/schema');
  try {
    const response = await fetch(`${baseUrl}/api/scores/debug/schema`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log('   Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('   Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Game result endpoint with the actual parameters from the error
  console.log('3. Testing /api/scores/result with actual parameters');
  const sessionId = '4061f855-04fd-4908-877f-7dc3dca0032f';
  const playerId = '795dec49-d7f0-4c76-9217-e1f57354f203';
  
  try {
    const response = await fetch(`${baseUrl}/api/scores/result?sessionId=${sessionId}&playerId=${playerId}`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log('   Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('   Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Health check
  console.log('4. Testing /health');
  try {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log('   Response:', data);
  } catch (error) {
    console.error('   Error:', error.message);
  }
}

testEndpoints().catch(console.error);
