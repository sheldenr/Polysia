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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function wipe() {
  console.log("Wiping all data from database...");

  // Delete all users (this cascades to profiles, flashcards, activities)
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError.message);
  } else {
    console.log(`Found ${users.length} users to delete.`);
    for (const user of users) {
      console.log(`Deleting user ${user.id} (${user.email})...`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Error deleting user ${user.id}:`, deleteError.message);
      }
    }
  }

  // Explicitly clear tables just in case or for data not tied to users
  const tables = ['flashcards', 'learning_activity', 'profiles', 'posts', 'comments'];
  for (const table of tables) {
    console.log(`Attempting to clear table: ${table}`);
    const { error } = await supabase.from(table).delete().neq('created_at', '1970-01-01');
    if (error) {
      console.log(`Note: Clearing ${table} via 'created_at' failed (${error.message}), trying alternative...`);
      // Try another common column
      const { error: error2 } = await supabase.from(table).delete().not('id', 'is', null);
      if (error2) {
          console.error(`Could not clear ${table}:`, error2.message);
      } else {
          console.log(`Cleared ${table}`);
      }
    } else {
      console.log(`Cleared ${table}`);
    }
  }

  console.log("Database wipe complete.");
}

wipe();
