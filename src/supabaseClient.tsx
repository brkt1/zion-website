import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rpaxjodkgxfgneflavnj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwYXhqb2RrZ3hmZ25lZmxhdm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NDQyMzcsImV4cCI6MjA0NzQyMDIzN30.GSzz1RA75KCX3NiGfz2LOIAuXMPFYQy-fjXYH1S93cc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
