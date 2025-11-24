export type LogLevel = "debug" | "info" | "warn" | "error";

export interface RellaConfig {
  api_key: string | null;
  provider: "openrouter" | "gemini" | "local";
  model: string;
  log_level: LogLevel;
  editor: string | null;
  allowed_commands: string[]; // patterns/globs
  denied_commands: string[];
  default_context: string;
  streaming: boolean;
}
