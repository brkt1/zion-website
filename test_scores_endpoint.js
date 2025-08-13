// Test script to verify the scores endpoint
const fetch = require('node-fetch');

async function testScoresEndpoint() {
  try {
    console.log('Testing scores endpoint...');
    
    // Test the basic endpoint
    const response = await fetch('http://localhost:3001/api/scores/test');
    const data = await response.json();
    console.log('Test endpoint response:', data);
    
    // Test the result endpoint with dummy data
    const resultResponse = await fetch('http://localhost:3001/api/scores/result?sessionId=test&playerId=test');
    const resultData = await resultResponse.json();
    console.log('Result endpoint response:', resultData);
    
  } catch (error) {
    console.error('Error testing endpoint:', error.message);
  }
}

testScoresEndpoint();
