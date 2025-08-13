// Test script for the game result API endpoint
// Run this with: node test_game_result_api.js

const fetch = require('node-fetch');

async function testGameResultAPI() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('Testing Game Result API...\n');
  
  // Test 1: Missing parameters
  console.log('Test 1: Missing sessionId and playerId');
  try {
    const response = await fetch(`${baseUrl}/api/scores/result`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Invalid parameters
  console.log('Test 2: Invalid sessionId and playerId');
  try {
    const response = await fetch(`${baseUrl}/api/scores/result?sessionId=invalid&playerId=invalid`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Valid parameters (should return 404 if no data exists)
  console.log('Test 3: Valid parameters (no data exists)');
  try {
    const response = await fetch(`${baseUrl}/api/scores/result?sessionId=test-session-123&playerId=test-player-456`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Health check
  console.log('Test 4: Health check');
  try {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the tests
testGameResultAPI().catch(console.error);
