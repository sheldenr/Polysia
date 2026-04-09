import { RequestHandler } from "express";
import { z } from "zod";
import { DeepSeekV3Response } from "@shared/api";

const deepSeekRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1)
    .max(20),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).max(1000).optional(),
});

export const handleDeepSeekRoleplay: RequestHandler = async (req, res) => {
  const parsed = deepSeekRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid request payload",
    });
  }

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
        messages: parsed.data.messages,
        temperature: parsed.data.temperature ?? 0.7,
        max_tokens: parsed.data.max_tokens ?? 220,
      }),
    });

    const upstreamBody = (await upstream.json()) as {
      model?: string;
      usage?: DeepSeekV3Response["usage"];
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!upstream.ok) {
      return res.status(502).json({
        error:
          upstreamBody.error?.message ??
          "DeepSeek request failed. Please try again.",
      });
    }

    const content = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(502).json({
        error: "DeepSeek returned an empty response.",
      });
    }

    const response: DeepSeekV3Response = {
      content,
      model: upstreamBody.model ?? model,
      usage: upstreamBody.usage,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("DeepSeek roleplay error:", error);
    return res.status(500).json({
      error: "Unable to reach DeepSeek right now.",
    });
  }
};

