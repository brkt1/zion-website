import { randomBytes } from 'crypto';

const generateKey = () => {
  return randomBytes(32).toString('hex'); // Generates a 32-byte key
};

console.log('Generated VITE_STORAGE_KEY:', generateKey());
