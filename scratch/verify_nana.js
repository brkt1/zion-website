const https = require('https');
const fs = require('fs');

let envFile = '';
try {
  envFile = fs.readFileSync('server/.env', 'utf8');
} catch (e) {
  try {
    envFile = fs.readFileSync('.env', 'utf8');
  } catch (e2) {}
}

// Find secret key
const secretKey = envFile.match(/CHAPA_SECRET_KEY=(.*)/)?.[1]?.trim() || process.env.CHAPA_SECRET_KEY || 'CHASECK-vQYvVjXp3FjU4zE4B7K5C3Q5V2R6T7Y8'; // let's see if we have it

console.log("Using Chapa secret key:", secretKey ? secretKey.substring(0, 15) + '...' : 'undefined');

if (!secretKey) {
  console.error("No Chapa secret key found.");
  process.exit(1);
}

const tx_ref = 'YENEGE-MQN9Y3WSFFJ8ZS26WXD';

const req = https.request({
  hostname: 'api.chapa.co',
  port: 443,
  path: `/v1/transaction/verify/${tx_ref}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  },
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log("Verification Response:", JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log("Raw response:", data);
    }
  });
});

req.on('error', (e) => {
  console.error("Error:", e);
});
req.end();
