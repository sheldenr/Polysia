import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !deepseekApiKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const categories = [
  "Business In China", 
  "Buzzwords", 
  "Culture", 
  "Current Events", 
  "Dialogue", 
  "Food", 
  "History", 
  "Life In China", 
  "Work", 
  "Funny Story", 
  "Language", 
  "Everyday Life"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateStoryIdea(level) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const chapterCount = Math.floor(Math.random() * 6) + 3; // 3 to 8 chapters
  
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
    console.error(`Error generating story idea for HSK ${level}:`, error.message);
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
      "title_zh": "A unique, creative Chinese chapter title specific to this plot event (e.g. '可疑的黑猫' or '上海的第一场雪'). DO NOT use generic chapter numbers or generic words like '第一章', '介绍', '开头', '第一话' as it must be globally unique.",
      "title_en": "Natural English translation of the chapter title",
      "content_zh": "A detailed, engaging story passage of between 750 and 1500 characters of HSK ${storyline.hsk_level} Chinese. Make sure it fully develops the plot for this chapter and strictly follows HSK ${storyline.hsk_level} grammar/vocabulary constraints.",
      "content_en": "Natural English translation of each sentence in content_zh, in order."
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
  
  const dbStory = {
    title_zh: story.title_zh,
    title_en: story.title_en,
    content_zh: `${story.content_zh.trim()} ||| ${story.content_en.trim()}`,
    hsk_level: story.hsk_level,
    category: story.category,
    storyline_id: story.storyline_id,
    chapter_number: story.chapter_number
  };

  try {
    const { error } = await supabase.from("stories").upsert(dbStory, { onConflict: "title_zh" });
    if (error) {
      console.warn(`    Error saving to Supabase, retrying in 5s... (Attempt ${retryCount + 1}): ${error.message}`);
      await sleep(5000);
      return saveToSupabase(story, retryCount + 1);
    }
    return true;
  } catch (err) {
    console.error("    Unexpected error saving to Supabase:", err.message);
    return false;
  }
}

async function run() {
  console.log("Wiping all existing stories from the database...");
  const { error: wipeError } = await supabase.from("stories").delete().not("id", "is", null);
  if (wipeError) {
    console.error("Failed to wipe stories from database:", wipeError.message);
    process.exit(1);
  }
  console.log("Database cleared successfully!");

  // Skewed towards lower difficulties
  const targetHskLevels = [
    1, 1, 1, 1, 1, // 5 series for HSK 1
    2, 2, 2, 2, 2, // 5 series for HSK 2
    3, 3, 3, 3,    // 4 series for HSK 3
    4, 4, 4,       // 3 series for HSK 4
    5, 5,          // 2 series for HSK 5
    6              // 1 series for HSK 6
  ];
  const storyCount = targetHskLevels.length;
  console.log(`Starting bulk generation of ${storyCount} stories with skewed difficulties...`);

  for (let i = 0; i < storyCount; i++) {
    const level = targetHskLevels[i];
    const storyline = await generateStoryIdea(level);
    if (!storyline) continue;

    storyline.id = storyline.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    console.log(`\nStory ${i + 1}/${storyCount}: ${storyline.name} (HSK ${storyline.hsk_level}, ${storyline.chapter_count} chapters)`);

    const chapters = [];
    for (let j = 1; j <= storyline.chapter_count; j++) {
      const chapterData = await generateChapter(storyline, j, chapters);
      if (chapterData) {
        const story = {
          ...chapterData,
          storyline_id: storyline.name,
          chapter_number: j,
          hsk_level: storyline.hsk_level,
          category: storyline.category
        };
        
        const success = await saveToSupabase(story);
        if (success) {
          chapters.push(story);
        }
        await sleep(2000); // Delay between chapters
      }
    }
    console.log(`Completed: ${storyline.name}`);
    await sleep(2000); // Delay between stories
  }
  console.log("\nAll stories generated successfully!");
}

run();
