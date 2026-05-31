import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log("Testing simple insert...");
  const { data, error } = await supabase.from('stories').insert({
    title_zh: "测试故事" + Math.random(),
    title_en: "Test Story",
    content_zh: "这是一个测试。",
    hsk_level: 1,
    category: "Test"
  }).select();

  if (error) {
    console.error("Insert error:", error.message, error.code);
  } else {
    console.log("Insert success:", data);
  }
}

test();
