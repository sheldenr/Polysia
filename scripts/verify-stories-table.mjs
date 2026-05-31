import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data, error } = await supabase.from('stories').select('count', { count: 'exact', head: true });
  if (error) {
    console.error(`Error checking stories table:`, error.message, error.code);
  } else {
    console.log(`Stories table exists. Current row count: ${data || 0}`);
  }
}

check();
