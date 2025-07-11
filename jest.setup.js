import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Mock import.meta.env for Jest
// This ensures that environment variables accessed via import.meta.env
// are available during testing, mimicking Vite's behavior.
Object.defineProperty(global, 'import.meta', {
  value: {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      // Add other VITE_ variables as needed
    },
  },
  writable: true,
});
