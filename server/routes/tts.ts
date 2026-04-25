import { RequestHandler } from "express";
import { z } from "zod";

const ttsRequestSchema = z.object({
  text: z.string().min(1),
  voice_id: z.string().optional().default("Yichen"), // Use Yichen as the default Chinese voice
});

/**
 * Handles TTS requests by proxying to Inworld AI TTS API.
 * Returns a stream of audio bytes (MP3).
 */
export const handleTTS: RequestHandler = async (req, res) => {
  const parsed = ttsRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid request payload",
    });
  }

  // Detect Chinese characters to force a Chinese voice if an English one was requested
  const hasChinese = /[\u4e00-\u9fff]/.test(parsed.data.text);
  let voice_id = parsed.data.voice_id;

  if (hasChinese && (voice_id === "Sarah" || !voice_id)) {
    voice_id = "Yichen";
  }

  // Use environment variable for authentication.
  const auth = process.env.INWORLD_TTS_AUTH;

  if (!auth) {
    console.error("[Inworld TTS] Missing INWORLD_TTS_AUTH environment variable");
    return res.status(500).json({ error: "TTS configuration error" });
  }

  try {
    const body = {
      text: parsed.data.text,
      voice_id: voice_id,
      audio_config: {
        audio_encoding: "MP3"
      },
      model_id: "inworld-tts-1.5-max"
    };

    console.log(`[Inworld TTS] Sending request to Inworld:`, JSON.stringify(body, null, 2));

    const response = await fetch("https://api.inworld.ai/tts/v1/voice:stream", {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log(`[Inworld TTS] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Inworld TTS] API error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: "TTS request failed", 
        message: errorText 
      });
    }

    if (!response.body) {
      return res.status(500).json({ 
        error: "TTS request failed", 
        message: "Empty response body from Inworld" 
      });
    }

    // Set headers for audio streaming
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      // Set headers for audio binary response
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Transfer-Encoding", "chunked");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // The Inworld API returns a stream of JSON objects
        buffer += decoder.decode(value, { stream: true });

        // Search for complete JSON objects in the buffer
        let startIdx = buffer.indexOf("{");
        while (startIdx !== -1) {
          // Find the matching closing brace for this object
          // This is a simple approach for Inworld's specific output
          let depth = 0;
          let endIdx = -1;
          for (let i = startIdx; i < buffer.length; i++) {
            if (buffer[i] === "{") depth++;
            else if (buffer[i] === "}") {
              depth--;
              if (depth === 0) {
                endIdx = i;
                break;
              }
            }
          }

          if (endIdx !== -1) {
            const part = buffer.slice(startIdx, endIdx + 1);
            buffer = buffer.slice(endIdx + 1);
            
            try {
              const json = JSON.parse(part);
              const base64Audio = json.result?.audioContent;
              if (base64Audio) {
                res.write(Buffer.from(base64Audio, "base64"));
              }
            } catch (err) {
              console.error("[Inworld TTS] JSON parse error:", err);
            }
            
            startIdx = buffer.indexOf("{");
          } else {
            // No complete object found yet
            break;
          }
        }
      }
    } catch (readError) {
      console.error("[Inworld TTS] Stream read error:", readError);
    } finally {
      reader.releaseLock();
      res.end();
    }

  } catch (error) {
    console.error("[Inworld TTS] error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.end();
    }
  }
};
