import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

console.log("Connecting to:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debug() {
  // Try to list tables using a raw query or just common ones
  const tables = ['profiles', 'stories', 'flashcards'];
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`Table '${t}': Error - ${error.message} (${error.code})`);
    } else {
      console.log(`Table '${t}': OK - count ${data || 0}`);
    }
  }
}

debug();
