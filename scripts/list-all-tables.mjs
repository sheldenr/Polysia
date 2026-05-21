import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // This might fail if RPC not defined
  if (error) {
    console.log("RPC get_tables failed, trying direct query if possible (likely won't work via PostgREST)");
    // PostgREST doesn't allow direct query to information_schema usually.
    // But we can try to guess or use a specific RPC if user has one.
  } else {
    console.log("Tables:", data);
    return;
  }

  // Alternative: use the Supabase management API? No, we don't have that key.
  
  // Try to query a common table that might exist if it's not our app.
  // Actually, let's just try to see if we can get anything from information_schema.tables
  // using a raw SQL if we have an RPC like 'exec_sql'.
  
  console.log("Attempting to check for some other common tables...");
  const commonTables = ['users', 'posts', 'comments', 'profiles', 'flashcards', 'learning_activity'];
  for (const table of commonTables) {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (!error) {
          console.log(`Table ${table} exists.`);
      } else if (error.code !== '42P01') { // 42P01 is undefined_table
          console.log(`Table ${table} might exist, error: ${error.message}`);
      }
  }
}

listTables();
