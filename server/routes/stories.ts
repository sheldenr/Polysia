import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";

export async function handleGetStories(req: Request, res: Response) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    const { data, error } = await supabaseAdmin
      .from("stories")
      .select("*")
      .order("hsk_level", { ascending: true })
      .order("storyline_id", { ascending: true })
      .order("chapter_number", { ascending: true });

    if (error) throw error;

    const mappedData = (data || []).map((story) => {
      const parts = (story.content_zh || "").split("|||");
      return {
        ...story,
        content_zh: parts[0]?.trim(),
        content_en: parts[1]?.trim() || "",
      };
    });

    res.json(mappedData);
  } catch (error) {
    console.error("Error in handleGetStories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function handleGetStoryById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    const { data, error } = await supabaseAdmin
      .from("stories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (data) {
      const parts = (data.content_zh || "").split("|||");
      data.content_zh = parts[0]?.trim();
      data.content_en = parts[1]?.trim() || "";
    }

    res.json(data);
  } catch (error) {
    console.error("Error in handleGetStoryById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
