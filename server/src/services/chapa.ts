import { Chapa } from 'chapa-nodejs';
import dotenv from 'dotenv';

// Ensure dotenv is loaded before accessing environment variables
dotenv.config();

const secretKey = process.env.CHAPA_SECRET_KEY || '';

// Validate API key is set
if (!secretKey) {
  console.error('⚠️  WARNING: CHAPA_SECRET_KEY is not set in environment variables!');
  console.error('   Make sure you have a .env file in the server directory with CHAPA_SECRET_KEY set.');
} else if (!secretKey.startsWith('CHASECK_')) {
  console.warn('⚠️  WARNING: CHAPA_SECRET_KEY does not start with CHASECK_. This may be invalid.');
  console.warn('   Production keys should start with CHASECK- (not CHASECK_TEST-)');
} else {
  const isTestKey = secretKey.startsWith('CHASECK_TEST-');
  const keyType = isTestKey ? 'TEST' : 'PRODUCTION';
  console.log(`✅ Chapa API key loaded (${keyType}):`, secretKey.substring(0, 20) + '...');
  if (isTestKey) {
    console.warn('⚠️  WARNING: Using TEST key. For production, use a key starting with CHASECK- (not CHASECK_TEST-)');
  }
}

const chapa = new Chapa({
  secretKey: secretKey,
});

export default chapa;

