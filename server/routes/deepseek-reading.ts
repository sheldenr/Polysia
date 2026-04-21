import { RequestHandler } from "express";
import { DeepSeekReadingPromptResponse } from "../../shared/api";

const randomTopics = [
  "a surprising street food discovery",
  "a rainy-day commute mishap",
  "a weekend mountain hike",
  "an unexpected bookstore conversation",
  "a neighborhood festival moment",
  "a train station delay story",
  "a first visit to a night market",
  "a small act of kindness from a stranger",
  "trying a new hobby class",
  "a day working from a cafe",
];

function normalizeReadingText(text: string) {
  const compact = text.replace(/\s+/g, "").trim();

  if (compact.length <= 230) {
    return compact;
  }

  const trimmed = compact.slice(0, 220);
  return trimmed.replace(/[，。！？；、]*$/, "。");
}

function stripCodeFences(raw: string) {
  let content = raw.trim();
  
  // Try to find a JSON block with regex first if it's not a plain JSON string
  if (!content.startsWith("{")) {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      content = match[1].trim();
    }
  }

  // If still no luck, try a broader search for anything between curly braces
  if (!content.startsWith("{")) {
    const match = content.match(/(\{[\s\S]*\})/);
    if (match && match[1]) {
      content = match[1].trim();
    }
  }

  return content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

export const handleDeepSeekReading: RequestHandler = async (_req, res) => {
  console.log("[DeepSeek Reading] Received request for reading prompt");
  
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("[DeepSeek Reading] Missing DEEPSEEK_API_KEY");
    return res.status(500).json({
      error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment.",
    });
  }

  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const selectedTopic =
    randomTopics[Math.floor(Math.random() * randomTopics.length)];

  // Create an AbortController to implement a timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000); // 9 second timeout

  try {
    console.log(`[DeepSeek Reading] Fetching from DeepSeek with topic: ${selectedTopic}`);
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.6, // Slightly lower temperature for faster/more stable generation
        max_tokens: 400, // Slightly more tokens to avoid truncation
        messages: [
          {
            role: "system",
            content:
              'You are a Chinese reading tutor. Return strict JSON only (no markdown): {"titleZh":"...","titleEn":"...","text":"...","quiz":[{"question":"...","answer":true},{"question":"...","answer":false}]}. titleZh should be a concise Chinese topic title (4-12 chars). titleEn should be the natural English translation of that Chinese title. text must be a single Mandarin passage between 180 and 220 Chinese characters. text must contain only Chinese (no English, no pinyin, no bullets). quiz must contain exactly 2 true/false questions that are directly based on details from text. Each question must be in English and each answer must be a boolean.',
          },
          {
            role: "user",
            content:
              `Create today's reading passage for an intermediate learner. Use a random topic around: ${selectedTopic}.`,
          },
        ],
      }),
    });

    clearTimeout(timeoutId);

    const upstreamBody = (await upstream.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!upstream.ok) {
      console.error("[DeepSeek Reading] Upstream error:", upstream.status, upstreamBody.error);
      return res.status(502).json({
        error:
          upstreamBody.error?.message ??
          "DeepSeek reading prompt request failed.",
      });
    }

    const content = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error("[DeepSeek Reading] Empty content from DeepSeek");
      return res.status(502).json({
        error: "DeepSeek returned an empty reading prompt.",
      });
    }

    console.log("[DeepSeek Reading] Successfully received response from DeepSeek");

    let parsed:
      | {
          titleZh?: string;
          titleEn?: string;
          text?: string;
          quiz?: Array<{ question?: string; answer?: boolean }>;
        }
      | null = null;
    const strippedContent = stripCodeFences(content);
    try {
      parsed = JSON.parse(strippedContent) as {
        titleZh?: string;
        titleEn?: string;
        text?: string;
        quiz?: Array<{ question?: string; answer?: boolean }>;
      };
    } catch (err) {
      console.error("DeepSeek JSON Parse Error:", err);
      console.error("Raw Content:", content);
      console.error("Stripped Content:", strippedContent);
      return res.status(502).json({
        error: "DeepSeek returned an invalid reading payload.",
        debug: process.env.NODE_ENV === "development" ? { content, err: String(err) } : undefined,
      });
    }

    const titleZh = parsed.titleZh?.trim();
    const titleEn = parsed.titleEn?.trim();
    const text = parsed.text?.trim();
    const quiz = parsed.quiz;

    if (
      !titleZh ||
      !titleEn ||
      !text ||
      !Array.isArray(quiz) ||
      quiz.length !== 2 ||
      quiz.some((item) => !item.question?.trim() || typeof item.answer !== "boolean")
    ) {
      console.error("DeepSeek Validation Error: Missing required fields");
      console.error("Parsed Data:", parsed);
      return res.status(502).json({
        error: "DeepSeek reading payload is missing required fields.",
        debug: process.env.NODE_ENV === "development" ? { parsed } : undefined,
      });
    }

    const response: DeepSeekReadingPromptResponse = {
      titleZh,
      titleEn,
      text: normalizeReadingText(text),
      quiz: quiz.map((item) => ({
        question: item.question!.trim(),
        answer: item.answer as boolean,
      })),
      model: upstreamBody.model ?? model,
    };

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[DeepSeek Reading] Request timed out");
      return res.status(504).json({
        error: "DeepSeek took too long to respond. Please try again in a moment.",
      });
    }

    console.error("DeepSeek reading prompt error:", error);
    return res.status(500).json({
      error: "Unable to generate reading prompt right now.",
    });
  }
};
