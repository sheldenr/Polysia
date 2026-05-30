import { supabaseAdmin } from "./server/lib/supabase-admin.js";

const initialStories = [
  {
    title_zh: "早上好",
    title_en: "Good Morning",
    content_zh: "你好！我叫王明。我是一个学生。我每天六点起床。我喜欢喝茶，不喜欢喝咖啡。",
    hsk_level: 1,
    category: "Daily Life"
  },
  {
    title_zh: "在餐厅",
    title_en: "At the Restaurant",
    content_zh: "服务员，你好。我想看菜单。我想吃米饭和鱼。多少钱？三十块。谢谢。",
    hsk_level: 1,
    category: "Food"
  },
  {
    title_zh: "我的家人",
    title_en: "My Family",
    content_zh: "我家有五口人：爸爸，妈妈，哥哥，姐姐和我。我爸爸是医生，我妈妈是老师。",
    hsk_level: 1,
    category: "Family"
  },
  {
    title_zh: "去北京旅游",
    title_en: "Traveling to Beijing",
    content_zh: "明年我想去北京旅游。北京是一个很大的城市。我想看长城，也想吃北京烤鸭。我觉得北京的天气很好。",
    hsk_level: 2,
    category: "Travel"
  },
  {
    title_zh: "找工作",
    title_en: "Finding a Job",
    content_zh: "他在一家电脑公司找了一份工作。虽然他觉得很累，但是他很喜欢这份工作。他的同事都很热情。",
    hsk_level: 3,
    category: "Work"
  }
];

async function seedStories() {
  console.log("Seeding initial stories...");
  for (const story of initialStories) {
    const { error } = await supabaseAdmin
      .from("stories")
      .upsert(story, { onConflict: "title_zh" });
    
    if (error) {
      console.error(`Error seeding story ${story.title_zh}:`, error);
    } else {
      console.log(`Successfully seeded: ${story.title_zh}`);
    }
  }
}

seedStories().then(() => console.log("Done."));
