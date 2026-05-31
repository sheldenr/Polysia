import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !deepseekApiKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const hskLevels = [1, 2, 3, 4, 5, 6];
const categories = [
  "Daily Life", "Mystery", "Romance", "Travel", "Business", 
  "Culture", "Science", "Philosophy", "Technology", "Literature", 
  "Politics", "History", "Fantasy", "Cooking", "Sports"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateStoryIdea() {
  const level = hskLevels[Math.floor(Math.random() * hskLevels.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const chapterCount = Math.floor(Math.random() * 5) + 6; // 6 to 10
  
  const prompt = `
    Generate a unique story idea for a multi-chapter Chinese learning story.
    Difficulty: HSK ${level}
    Category: ${category}
    
    Return JSON only:
    {
      "name": "Story Title in English",
      "hsk_level": ${level},
      "category": "${category}",
      "chapter_count": ${chapterCount},
      "description": "Brief English description of the plot"
    }
  `;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error generating story idea:", error.message);
    return null;
  }
}

async function generateChapter(storyline, chapterNum, previousChapters = [], retryCount = 0) {
  if (retryCount > 2) return null;

  console.log(`  - Generating Chapter ${chapterNum}/${storyline.chapter_count}...`);
  
  const prompt = `
    Writer for Chinese language learners. 
    Story: "${storyline.name}" (${storyline.description})
    Difficulty: HSK ${storyline.hsk_level}
    Chapter: ${chapterNum}
    
    Context:
    ${previousChapters.length > 0 ? previousChapters.map(c => `Chapter ${c.chapter_number}: ${c.title_en}`).join("\n") : "Starting the story."}
    
    Return strict JSON:
    {
      "title_zh": "Chinese title",
      "title_en": "English title",
      "content_zh": "150-300 characters of HSK ${storyline.hsk_level} Chinese"
    }
  `;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant that returns only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean control characters that often break JSON.parse
    content = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    
    return JSON.parse(content);
  } catch (error) {
    console.error(`    Retry ${retryCount + 1} for chapter ${chapterNum}:`, error.message);
    await sleep(3000);
    return generateChapter(storyline, chapterNum, previousChapters, retryCount + 1);
  }
}

async function saveToSupabase(story, retryCount = 0) {
  if (retryCount > 2) return false;
  
  try {
    const { error } = await supabase.from("stories").upsert(story, { onConflict: "title_zh" });
    if (error) {
      if (error.message.includes("schema cache")) {
        console.warn(`    Schema cache issue, retrying in 5s... (Attempt ${retryCount + 1})`);
        await sleep(5000);
        return saveToSupabase(story, retryCount + 1);
      }
      console.error("    Error saving to Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("    Unexpected error saving to Supabase:", err.message);
    return false;
  }
}

async function run() {
  const storyCount = 5;
  console.log(`Starting bulk generation of ${storyCount} stories...`);

  for (let i = 0; i < storyCount; i++) {
    const storyline = await generateStoryIdea();
    if (!storyline) continue;

    storyline.id = storyline.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    console.log(`\nStory ${i + 1}: ${storyline.name} (HSK ${storyline.hsk_level}, ${storyline.chapter_count} chapters)`);

    const chapters = [];
    for (let j = 1; j <= storyline.chapter_count; j++) {
      const chapterData = await generateChapter(storyline, j, chapters);
      if (chapterData) {
        const story = {
          ...chapterData,
          storyline_id: storyline.id,
          chapter_number: j,
          hsk_level: storyline.hsk_level,
          category: storyline.category
        };
        
        const success = await saveToSupabase(story);
        if (success) {
          chapters.push(story);
        }
        await sleep(2000); // Increased delay
      }
    }
    console.log(`Completed: ${storyline.name}`);
    await sleep(2000); // Delay between stories
  }
  console.log("\nAll stories generated successfully!");
}

run();
