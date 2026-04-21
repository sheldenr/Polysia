import { RequestHandler } from "express";
import { z } from "zod";
import type { DeepSeekV3Response } from "../../shared/api";

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

type DeepSeekUpstreamBody = {
  model?: string;
  usage?: DeepSeekV3Response["usage"];
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

async function parseDeepSeekUpstreamBody(response: Response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return {
      body: {} as DeepSeekUpstreamBody,
      parseError: false,
      rawBody: "",
    };
  }

  try {
    return {
      body: JSON.parse(rawBody) as DeepSeekUpstreamBody,
      parseError: false,
      rawBody,
    };
  } catch {
    return {
      body: {} as DeepSeekUpstreamBody,
      parseError: true,
      rawBody,
    };
  }
}

export const handleDeepSeekRoleplay: RequestHandler = async (req, res) => {
  console.log("[DeepSeek Roleplay] Received request");
  const parsed = deepSeekRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid request payload",
    });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("[DeepSeek Roleplay] Missing DEEPSEEK_API_KEY");
    return res.status(500).json({
      error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment.",
    });
  }

  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 25000);

  // Create an AbortController to implement a timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 25000,
  );

  try {
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: parsed.data.messages,
        temperature: parsed.data.temperature ?? 0.7,
        max_tokens: parsed.data.max_tokens ?? 220,
      }),
    });

    const { body: upstreamBody, parseError, rawBody } =
      await parseDeepSeekUpstreamBody(upstream);

    if (!upstream.ok) {
      console.error(
        `[DeepSeek Roleplay] API error (${upstream.status}):`,
        upstreamBody.error ?? rawBody.slice(0, 300),
      );
      return res.status(502).json({
        error:
          upstreamBody.error?.message ??
          `DeepSeek request failed with status ${upstream.status}.`,
        debug: process.env.NODE_ENV === "development" ? upstreamBody : undefined,
      });
    }

    if (parseError) {
      console.error("[DeepSeek Roleplay] Upstream returned non-JSON body:", rawBody.slice(0, 300));
      return res.status(502).json({
        error: "DeepSeek returned a non-JSON response.",
      });
    }

    const content = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error("[DeepSeek Roleplay] Empty response choices:", upstreamBody.choices);
      return res.status(502).json({
        error: "DeepSeek returned an empty response.",
        debug: process.env.NODE_ENV === "development" ? upstreamBody : undefined,
      });
    }

    const response: DeepSeekV3Response = {
      content,
      model: upstreamBody.model ?? model,
      usage: upstreamBody.usage,
    };

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[DeepSeek Roleplay] Request timed out");
      return res.status(504).json({
        error: "DeepSeek took too long to respond. Please try again.",
      });
    }

    console.error("DeepSeek roleplay error:", error);
    return res.status(500).json({
      error: "Unable to reach DeepSeek right now.",
    });
  } finally {
    clearTimeout(timeoutId);
  }
};
