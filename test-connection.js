#!/usr/bin/env node

/**
 * Test script to verify frontend-backend connection
 * This script checks:
 * 1. Backend health endpoint
 * 2. CORS configuration
 * 3. API endpoints accessibility
 */

const https = require('https');
const http = require('http');

// Configuration
// NOTE: Update this URL after redeploying the backend service
// Options:
// - Railway: https://yenege-backend-production.up.railway.app
// - Render: https://yenege-backend.onrender.com
// - Fly.io: https://yenege-backend.fly.dev
// Or set BACKEND_URL environment variable: BACKEND_URL=https://your-url.com node test-connection.js
const BACKEND_URL = process.env.BACKEND_URL || 'https://yenege-backend.onrender.com';
const FRONTEND_URLS = [
  'https://www.yenege.com',
  'https://yenege.com'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Connection-Test-Script',
        ...options.headers,
      },
      timeout: 10000,
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData || data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testBackendHealth() {
  log('\n📡 Testing Backend Health Endpoint...', 'cyan');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    if (response.status === 200) {
      log('✅ Backend is healthy and responding', 'green');
      log(`   Status: ${response.status}`, 'green');
      log(`   Response: ${JSON.stringify(response.data)}`, 'green');
      return true;
    } else {
      log(`❌ Backend returned status ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function testCORS(origin) {
  log(`\n🌐 Testing CORS for origin: ${origin}`, 'cyan');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`, {
      headers: {
        'Origin': origin,
      },
    });

    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
    };

    if (corsHeaders['access-control-allow-origin']) {
      log('✅ CORS headers present', 'green');
      log(`   Access-Control-Allow-Origin: ${corsHeaders['access-control-allow-origin']}`, 'green');
      log(`   Access-Control-Allow-Credentials: ${corsHeaders['access-control-allow-credentials'] || 'not set'}`, 'green');
      log(`   Access-Control-Allow-Methods: ${corsHeaders['access-control-allow-methods'] || 'not set'}`, 'green');

      // Check if origin is allowed
      const allowedOrigin = corsHeaders['access-control-allow-origin'];
      if (allowedOrigin === origin || allowedOrigin === '*') {
        log(`✅ Origin ${origin} is allowed`, 'green');
        return true;
      } else {
        log(`⚠️  Origin ${origin} might not be allowed (got: ${allowedOrigin})`, 'yellow');
        return false;
      }
    } else {
      log('⚠️  CORS headers not found in response', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ CORS test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testPreflightRequest(origin) {
  log(`\n🔄 Testing CORS Preflight (OPTIONS) for origin: ${origin}`, 'cyan');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    if (response.status === 204 || response.status === 200) {
      log('✅ Preflight request successful', 'green');
      log(`   Status: ${response.status}`, 'green');
      return true;
    } else {
      log(`⚠️  Preflight returned status ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Preflight test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testPaymentEndpoint(origin) {
  log(`\n💳 Testing Payment Endpoint (with CORS from ${origin})...`, 'cyan');
  try {
    // Test a simple GET endpoint first (generate-tx-ref)
    const response = await makeRequest(`${BACKEND_URL}/api/payments/generate-tx-ref`, {
      headers: {
        'Origin': origin,
      },
    });

    if (response.status === 200) {
      log('✅ Payment endpoint is accessible', 'green');
      log(`   Status: ${response.status}`, 'green');
      if (response.data && response.data.tx_ref) {
        log(`   Generated tx_ref: ${response.data.tx_ref}`, 'green');
      }
      return true;
    } else if (response.status === 401 || response.status === 403) {
      log('⚠️  Payment endpoint requires authentication (expected)', 'yellow');
      return true; // This is expected for some endpoints
    } else {
      log(`⚠️  Payment endpoint returned status ${response.status}`, 'yellow');
      log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Payment endpoint test failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkFrontendConfiguration() {
  log('\n📋 Frontend Configuration Check...', 'cyan');
  log('   Expected REACT_APP_API_URL:', 'blue');
  log(`   ${BACKEND_URL}/api`, 'blue');
  log('\n   ⚠️  Note: This script cannot verify Vercel environment variables.', 'yellow');
  log('   Please check Vercel Dashboard → Settings → Environment Variables', 'yellow');
  log('   to ensure REACT_APP_API_URL is set correctly.', 'yellow');
}

async function main() {
  log('🚀 Frontend-Backend Connection Test', 'cyan');
  log('=' .repeat(50), 'cyan');
  log(`\nTesting Backend URL: ${BACKEND_URL}`, 'blue');
  log('⚠️  Note: If Railway trial expired, backend may not be accessible', 'yellow');
  log('   Update BACKEND_URL in this script or set BACKEND_URL env variable\n', 'yellow');

  const results = {
    backendHealth: false,
    cors: {},
    preflight: {},
    paymentEndpoint: {},
  };

  // Test backend health
  results.backendHealth = await testBackendHealth();

  if (!results.backendHealth) {
    log('\n❌ Backend is not accessible. Please check:', 'red');
    log('   1. Backend is deployed and running', 'red');
    log('   2. Backend URL is correct', 'red');
    log('   3. Backend is not blocked by firewall', 'red');
    return;
  }

  // Test CORS for each frontend URL
  for (const frontendUrl of FRONTEND_URLS) {
    results.cors[frontendUrl] = await testCORS(frontendUrl);
    results.preflight[frontendUrl] = await testPreflightRequest(frontendUrl);
    results.paymentEndpoint[frontendUrl] = await testPaymentEndpoint(frontendUrl);
  }

  // Check frontend configuration
  await checkFrontendConfiguration();

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 Test Summary', 'cyan');
  log('='.repeat(50), 'cyan');

  log(`\nBackend Health: ${results.backendHealth ? '✅ PASS' : '❌ FAIL'}`, results.backendHealth ? 'green' : 'red');

  for (const frontendUrl of FRONTEND_URLS) {
    log(`\n${frontendUrl}:`, 'blue');
    log(`  CORS: ${results.cors[frontendUrl] ? '✅ PASS' : '❌ FAIL'}`, results.cors[frontendUrl] ? 'green' : 'red');
    log(`  Preflight: ${results.preflight[frontendUrl] ? '✅ PASS' : '❌ FAIL'}`, results.preflight[frontendUrl] ? 'green' : 'red');
    log(`  Payment Endpoint: ${results.paymentEndpoint[frontendUrl] ? '✅ PASS' : '❌ FAIL'}`, results.paymentEndpoint[frontendUrl] ? 'green' : 'red');
  }

  // Recommendations
  log('\n' + '='.repeat(50), 'cyan');
  log('💡 Recommendations', 'cyan');
  log('='.repeat(50), 'cyan');

  if (!results.backendHealth) {
    log('\n❌ Backend is not accessible. Fix this first.', 'red');
  } else {
    const allCorsPassed = Object.values(results.cors).every(r => r);
    const allPreflightPassed = Object.values(results.preflight).every(r => r);

    if (!allCorsPassed || !allPreflightPassed) {
      log('\n⚠️  CORS issues detected:', 'yellow');
      log('   1. Check FRONTEND_URL environment variable in Railway', 'yellow');
      log('   2. Ensure it matches your actual frontend URL', 'yellow');
      log('   3. Redeploy backend after updating environment variables', 'yellow');
    } else {
      log('\n✅ CORS configuration looks good!', 'green');
    }

    log('\n📝 Next Steps:', 'blue');
    log('   1. Verify REACT_APP_API_URL in Vercel Dashboard', 'blue');
    log(`      Should be: ${BACKEND_URL}/api`, 'blue');
    log('   2. If changed, trigger a new deployment', 'blue');
    log('   3. Test payment flow from the frontend', 'blue');
  }

  log('\n');
}

// Run the tests
main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

