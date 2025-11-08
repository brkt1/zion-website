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
} else {
  console.log('✅ Chapa API key loaded:', secretKey.substring(0, 20) + '...');
}

const chapa = new Chapa({
  secretKey: secretKey,
});

export default chapa;

