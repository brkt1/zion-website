import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL || '', process.env.REACT_APP_SUPABASE_ANON_KEY || '');
async function test() {
  const { data, error } = await supabase.from('user_roles').select('*, users!inner(email)').limit(1);
  console.log(data, error);
}
test();
