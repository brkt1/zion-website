#!/usr/bin/env node

/**
 * Script to start ngrok and update FRONTEND_URL in .env file
 * Usage: node start-ngrok.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ENV_FILE = path.join(__dirname, '.env');
const NGROK_API = 'http://localhost:4040/api/tunnels';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getNgrokUrl() {
  return new Promise((resolve, reject) => {
    const req = http.get(NGROK_API, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const tunnels = JSON.parse(data);
          const httpsTunnel = tunnels.tunnels?.find(t => t.proto === 'https');
          if (httpsTunnel) {
            resolve(httpsTunnel.public_url);
          } else {
            reject(new Error('No HTTPS tunnel found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function updateEnvFile(ngrokUrl) {
  let envContent = '';
  
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf8');
  }

  // Update or add FRONTEND_URL
  if (envContent.includes('FRONTEND_URL=')) {
    envContent = envContent.replace(
      /FRONTEND_URL=.*/g,
      `FRONTEND_URL=${ngrokUrl}`
    );
  } else {
    envContent += (envContent.endsWith('\n') ? '' : '\n') + `FRONTEND_URL=${ngrokUrl}\n`;
  }

  fs.writeFileSync(ENV_FILE, envContent);
}

async function main() {
  console.log('🚀 Starting ngrok tunnel for frontend (port 3000)...\n');

  // Start ngrok
  const ngrok = spawn('ngrok', ['http', '3000'], {
    stdio: 'ignore',
    detached: false
  });

  // Wait for ngrok to start
  await sleep(3000);

  // Try to get the ngrok URL
  let ngrokUrl;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      ngrokUrl = await getNgrokUrl();
      break;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('❌ Failed to get ngrok URL after multiple attempts.');
        console.error('   Make sure ngrok started successfully.');
        ngrok.kill();
        process.exit(1);
      }
      await sleep(1000);
    }
  }

  console.log(`✅ Ngrok tunnel established: ${ngrokUrl}\n`);
  console.log('📝 Updating .env file...\n');

  updateEnvFile(ngrokUrl);

  console.log(`✅ Updated FRONTEND_URL in .env to: ${ngrokUrl}\n`);
  console.log('⚠️  IMPORTANT:');
  console.log('   1. Make sure your frontend is running on port 3000');
  console.log('   2. Restart your backend server to pick up the new FRONTEND_URL');
  console.log('   3. Ngrok is running in the background');
  console.log('   4. To stop ngrok, press Ctrl+C\n');
  console.log(`📋 Your ngrok URL: ${ngrokUrl}`);
  console.log('   Use this URL in your Chapa dashboard if needed\n');
  console.log('💡 To view ngrok dashboard: http://localhost:4040\n');

  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping ngrok...');
    ngrok.kill();
    process.exit(0);
  });

  // Keep ngrok running
  ngrok.on('exit', (code) => {
    console.log(`\n⚠️  Ngrok process exited with code ${code}`);
    process.exit(code);
  });
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

