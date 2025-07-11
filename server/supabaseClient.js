const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/media/becky/fbb95933-6bf3-476c-ad04-81ce8356b618/yenege/zion-website/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

module.exports = supabase;