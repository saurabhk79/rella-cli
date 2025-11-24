import type { AIMessage } from "./index.js";
import { logger } from "../../utils/logger.js";

/* Utility: read server-sent events (OpenAI-style) */
export async function streamSSE(
  res: Response,
  onToken: (t: string) => void,
  onDone: () => void
) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      onDone();
      return;
    }
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.replace("data:", "").trim();
      if (payload === "[DONE]") {
        onDone();
        return;
      }

      try {
        const json = JSON.parse(payload);
        const token =
          json?.choices?.[0]?.delta?.content ??
          json?.candidates?.[0]?.content?.parts?.[0]?.text ??
          null;

        if (token) onToken(token);
      } catch {
        continue;
      }
    }
  }
}
