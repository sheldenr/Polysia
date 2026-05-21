import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { existsSync } from "fs";

if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

console.log("Supabase URL present:", !!supabaseUrl);
if (supabaseUrl) {
  if (supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1")) {
    console.log("Environment: Local (Supabase CLI)");
  } else {
    console.log("Environment: Remote (Supabase Cloud)");
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const tables = ['profiles', 'flashcards', 'learning_activity', 'users', 'posts', 'comments'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`Error checking ${table}:`, error.message, error.code);
    } else {
      console.log(`Table ${table}: ${count} rows`);
    }
  }

  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error("Error listing users:", userError.message);
  } else {
    console.log(`Auth users: ${users.length}`);
  }
}

check();
