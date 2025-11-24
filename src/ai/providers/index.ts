import type { RellaConfig } from "../../config/ConfigTypes.js";
import { logger } from "../../utils/logger.js";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  name: string;
  complete(messages: AIMessage[]): Promise<string>;
}

export class NotConfiguredProvider implements AIProvider {
  name = "none";
  async complete(): Promise<string> {
    throw new Error("No AI provider configured or API key missing.");
  }
}

/* ────────────────────────────────────────────────────────────────
   OPENROUTER PROVIDER
   https://openrouter.ai/docs/api-reference/chat-completions
────────────────────────────────────────────────────────────────── */
export class OpenRouterProvider implements AIProvider {
  name = "openrouter";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(messages: AIMessage[]): Promise<string> {
    logger.debug("[OpenRouter] request", { model: this.model, messages });

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
      })
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OpenRouter error ${res.status}: ${error}`);
    }

    const data = await res.json();

    const output =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      "";

    logger.debug("[OpenRouter] response", { output });

    return output;
  }
}

/* ────────────────────────────────────────────────────────────────
   GEMINI PROVIDER
   https://ai.google.dev/api/rest/v1/models.generateContent
────────────────────────────────────────────────────────────────── */
export class GeminiProvider implements AIProvider {
  name = "gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(messages: AIMessage[]): Promise<string> {
    logger.debug("[Gemini] request", { model: this.model, messages });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const parts = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const body = { contents: parts };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Gemini error ${res.status}: ${error}`);
    }

    const data = await res.json();
    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.output_text ??
      "";

    logger.debug("[Gemini] response", { output });

    return output;
  }
}

/* ────────────────────────────────────────────────────────────────
   LOCAL PROVIDER (LLAMA.CPP)
   Implement properly later. For now, a stub.
────────────────────────────────────────────────────────────────── */
export class LocalProvider implements AIProvider {
  name = "local";
  private model: string;

  constructor(model: string) {
    this.model = model;
  }

  async complete(messages: AIMessage[]): Promise<string> {
    logger.debug("[Local] stub called", { model: this.model, messages });

    // TODO — integrate llama.cpp or local inference server  
    return `[local-model:${this.model}] ${messages[messages.length - 1]?.content}`;
  }
}

/* ────────────────────────────────────────────────────────────────
   FACTORY — chooses provider based on config
────────────────────────────────────────────────────────────────── */
export function createProvider(cfg: RellaConfig): AIProvider {
  // Local provider doesn't need API key
  if (cfg.provider === "local") {
    return new LocalProvider(cfg.model);
  }

  if (!cfg.api_key || cfg.api_key.trim().length === 0) {
    return new NotConfiguredProvider();
  }

  switch (cfg.provider) {
    case "openrouter":
      return new OpenRouterProvider(cfg.api_key, cfg.model);

    case "gemini":
      return new GeminiProvider(cfg.api_key, cfg.model);

    default:
      return new NotConfiguredProvider();
  }
}
