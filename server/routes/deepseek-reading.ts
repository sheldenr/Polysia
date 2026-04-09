import { RequestHandler } from "express";
import { DeepSeekReadingPromptResponse } from "@shared/api";

function normalizePromptLength(prompt: string) {
  const compact = prompt.replace(/\s+/g, "").trim();

  if (compact.length <= 230) {
    return compact;
  }

  const trimmed = compact.slice(0, 220);
  return trimmed.replace(/[，。！？；、]*$/, "。");
}

export const handleDeepSeekReading: RequestHandler = async (_req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment.",
    });
  }

  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  try {
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: 320,
        messages: [
          {
            role: "system",
            content:
              "You are a Chinese reading tutor. Generate one Mandarin reading prompt between 180 and 220 Chinese characters. Return only plain Chinese text, no title, no bullets, no markdown.",
          },
          {
            role: "user",
            content:
              "Create today's reading prompt for an intermediate learner focused on daily life situations.",
          },
        ],
      }),
    });

    const upstreamBody = (await upstream.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!upstream.ok) {
      return res.status(502).json({
        error:
          upstreamBody.error?.message ??
          "DeepSeek reading prompt request failed.",
      });
    }

    const prompt = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!prompt) {
      return res.status(502).json({
        error: "DeepSeek returned an empty reading prompt.",
      });
    }

    const response: DeepSeekReadingPromptResponse = {
      prompt: normalizePromptLength(prompt),
      model: upstreamBody.model ?? model,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("DeepSeek reading prompt error:", error);
    return res.status(500).json({
      error: "Unable to generate reading prompt right now.",
    });
  }
};
