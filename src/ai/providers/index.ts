import type { RellaConfig } from "../../config/ConfigTypes.js";
import { logger } from "../../utils/logger.js";
import { streamSSE } from "./stream.js";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  name: string;

  // make streaming optional
  complete(
    messages: AIMessage[],
    opts?: { stream?: boolean; onToken?: (t: string) => void }
  ): Promise<string>;
}

export class NotConfiguredProvider implements AIProvider {
  name = "none";
  async complete(): Promise<string> {
    throw new Error("AI provider not configured or API key missing.");
  }
}

/* ────────────────────────────────────────────────────────────────
   OPENROUTER PROVIDER
   https://openrouter.ai/docs/api-reference/chat-completions
────────────────────────────────────────────────────────────────── */
export class OpenRouterProvider implements AIProvider {
  name = "openrouter";
  constructor(private apiKey: string, private model: string) {}

  async complete(
    messages: AIMessage[],
    opts?: { stream?: boolean; onToken?: (t: string) => void }
  ): Promise<string> {
    const stream = opts?.stream === true;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/rella",
        "X-Title": "Rella CLI"
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream
      })
    });

    if (!res.ok) throw new Error(await res.text());

    if (!stream) {
      const data = await res.json();
      return (
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text ??
        ""
      );
    }

    let output = "";
    await streamSSE(
      res,
      token => {
        output += token;
        opts?.onToken?.(token);
      },
      () => {}
    );

    return output;
  }
}

/* ────────────────────────────────────────────────────────────────
   GEMINI PROVIDER
   https://ai.google.dev/api/rest/v1/models.generateContent
────────────────────────────────────────────────────────────────── */
export class GeminiProvider implements AIProvider {
  name = "gemini";
  constructor(private apiKey: string, private model: string) {}

  async complete(
    messages: AIMessage[],
    opts?: { stream?: boolean; onToken?: (t: string) => void }
  ): Promise<string> {
    const stream = opts?.stream === true;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?key=${this.apiKey}`;

    const parts = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: parts })
    });

    if (!res.ok) throw new Error(await res.text());

    if (!stream) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }

    let output = "";

    await streamSSE(
      res,
      token => {
        output += token;
        opts?.onToken?.(token);
      },
      () => {}
    );

    return output;
  }
}

/* ────────────────────────────────────────────────────────────────
   LOCAL PROVIDER (LLAMA.CPP)
   Implement properly later. For now, a stub.
────────────────────────────────────────────────────────────────── */
export class LocalProvider implements AIProvider {
  name = "local";
  constructor(private model: string) {}

  async complete(messages: AIMessage[]): Promise<string> {
    return `[local-model:${this.model}] ${messages[messages.length - 1]?.content}`;
  }
}

export function createProvider(cfg: RellaConfig): AIProvider {
  if (cfg.provider === "local") return new LocalProvider(cfg.model);
  if (!cfg.api_key) return new NotConfiguredProvider();

  switch (cfg.provider) {
    case "openrouter":
      return new OpenRouterProvider(cfg.api_key, cfg.model);
    case "gemini":
      return new GeminiProvider(cfg.api_key, cfg.model);
    default:
      return new NotConfiguredProvider();
  }
}
