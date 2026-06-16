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

const storylines = [
  { id: "living-in-shanghai", name: "Living in Shanghai", hsk_level: 1, category: "Daily Life" },
  { id: "the-missing-cat", name: "The Missing Cat", hsk_level: 1, category: "Mystery" },
  { id: "office-romance", name: "Office Romance", hsk_level: 2, category: "Romance" },
  { id: "food-tour-beijing", name: "Beijing Food Tour", hsk_level: 2, category: "Travel" },
  { id: "business-negotiation", name: "The Big Deal", hsk_level: 3, category: "Business" },
  { id: "history-of-tea", name: "Tea Culture", hsk_level: 3, category: "Culture" },
  { id: "climate-change", name: "Environmental Challenges", hsk_level: 4, category: "Science" },
  { id: "traditional-festivals", name: "Lunar New Year", hsk_level: 4, category: "Culture" },
  { id: "philosophical-debate", name: "Modern Ethics", hsk_level: 5, category: "Philosophy" },
  { id: "ai-revolution", name: "Future of Technology", hsk_level: 5, category: "Science" },
  { id: "ancient-legends", name: "Journey to the West Reframed", hsk_level: 6, category: "Literature" },
  { id: "political-landscape", name: "Global Relations", hsk_level: 6, category: "Politics" },
];

async function generateChapter(storyline, chapterNum, previousChapters = [], retryCount = 0) {
  if (retryCount > 2) {
    console.error(`Failed to generate chapter ${chapterNum} for ${storyline.name} after 3 attempts.`);
    return null;
  }

  console.log(`Generating Chapter ${chapterNum} for ${storyline.name} (HSK ${storyline.hsk_level})... attempt ${retryCount + 1}`);
  
  const hskConstraint = `The user is at HSK ${storyline.hsk_level} level. Use vocabulary and grammar structures appropriate for HSK ${storyline.hsk_level}.`;
  const prompt = `
    You are a professional Chinese story writer for language learners. 
    Create Chapter ${chapterNum} of a multi-chapter storyline titled "${storyline.name}".
    Category: ${storyline.category}.
    Difficulty Level: HSK ${storyline.hsk_level}.
    
    ${hskConstraint}
    
    Context from previous chapters:
    ${previousChapters.length > 0 ? previousChapters.map(c => `Chapter ${c.chapter_number}: ${c.title_en}`).join("\n") : "This is the first chapter."}
    
    IMPORTANT: Return strict JSON only. No markdown, no commentary.
    JSON Schema:
    {
      "title_zh": "Chapter title in Chinese",
      "title_en": "Natural English translation of the title",
      "content_zh": "Passage between 150-250 characters. Ensure it continues the plot from previous chapters if any.",
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
        temperature: 0.7
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Improved JSON extraction
    let jsonStr = content;
    if (content.includes("```")) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match && match[1]) {
        jsonStr = match[1].trim();
      }
    }
    
    // Strip potential leading/trailing non-JSON characters
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Error in attempt ${retryCount + 1}:`, error.message);
    return generateChapter(storyline, chapterNum, previousChapters, retryCount + 1);
  }
}

async function run() {
  for (const storyline of storylines) {
    const chapters = [];
    for (let i = 1; i <= 5; i++) {
      const chapterData = await generateChapter(storyline, i, chapters);
      if (chapterData) {
        const story = {
          ...chapterData,
          storyline_id: storyline.id,
          chapter_number: i,
          hsk_level: storyline.hsk_level,
          category: storyline.name // Use storyline name as category for grouping
        };
        
        const { error } = await supabase.from("stories").upsert(story, { onConflict: "title_zh" });
        if (error) {
          console.error("Error saving story:", error);
        } else {
          console.log(`Saved Chapter ${i} of ${storyline.name}`);
          chapters.push(story);
        }
      }
    }
  }
  console.log("Generation complete!");
}

run();
