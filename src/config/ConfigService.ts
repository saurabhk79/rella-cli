import * as TOML from "@iarna/toml";
const tomlStringify = TOML.stringify;
import { spawnSync } from "node:child_process";
import { CONFIG_DIR, CONFIG_FILE } from "./paths.js";
import { ensureDirSync, fileExists, readFileSafe, writeFileSafe } from "../utils/fs.js";
import type { RellaConfig } from "./ConfigTypes.js";
import { logger, setLogLevel } from "../utils/logger.js";

const DEFAULT_CONFIG: RellaConfig = {
  api_key: null,
  provider: "openrouter",
  model: "openrouter/llama-3.1-70b-instruct",
  log_level: "info",
  editor: process.env.EDITOR ?? null,
  allowed_commands: [], // empty = allow all except denied
  denied_commands: [],
  default_context: "",
  streaming: true
};

let cachedConfig: RellaConfig | null = null;

export function ensureConfigDir() {
  ensureDirSync(CONFIG_DIR);
}

export function loadConfig(): RellaConfig {
  ensureConfigDir();
  if (!fileExists(CONFIG_FILE)) {
    writeFileSafe(CONFIG_FILE, tomlStringify(DEFAULT_CONFIG as any));
    cachedConfig = DEFAULT_CONFIG;
    setLogLevel(DEFAULT_CONFIG.log_level);
    return DEFAULT_CONFIG;
  }

  if (cachedConfig) return cachedConfig;

  const raw = readFileSafe(CONFIG_FILE);
  if (!raw) {
    throw new Error("Failed to read config file");
  }

  let parsed: any;
  try {
    parsed = TOML.parse(raw);
  } catch (e) {
    throw new Error("Config file is invalid TOML. Fix ~/.rella/config.toml.");
  }

  const cfg: RellaConfig = {
    ...DEFAULT_CONFIG,
    ...parsed
  };
  cachedConfig = cfg;
  setLogLevel(cfg.log_level);
  return cfg;
}

export function saveConfig(config: RellaConfig) {
  writeFileSafe(CONFIG_FILE, tomlStringify(config as any));
  cachedConfig = config;
  setLogLevel(config.log_level);
}

export function setConfigValue(key: keyof RellaConfig, value: string) {
  const cfg = loadConfig();
  let newCfg = { ...cfg };

  if (key === "allowed_commands" || key === "denied_commands") {
    newCfg[key] = value.split(",").map(s => s.trim()).filter(Boolean);
  } else if (key === "log_level") {
    if (!["debug", "info", "warn", "error"].includes(value)) {
      throw new Error("Invalid log_level");
    }
    newCfg[key] = value as any;
  } else if (key === "provider") {
    if (!["openrouter", "gemini", "local"].includes(value)) {
      throw new Error("Invalid provider");
    }
    newCfg[key] = value as any;
  } else if (key === "api_key" || key === "editor" || key === "model" || key === "default_context") {
    newCfg[key] = value;
  } else {
    throw new Error(`Unsupported config key: ${key as string}`);
  }

  saveConfig(newCfg);
  logger.info(`Config key '${key}' updated.`);
}

export function getConfigValue(key: keyof RellaConfig): unknown {
  const cfg = loadConfig();
  return cfg[key];
}

export function openConfigInEditor() {
  const cfg = loadConfig(); // forces file creation
  const editor = cfg.editor ?? process.env.EDITOR ?? "vi";
  const result = spawnSync(editor, [CONFIG_FILE], {
    stdio: "inherit"
  });
  if (result.error) throw result.error;
}

export async function initConfigWizard() {
  ensureConfigDir();
  if (fileExists(CONFIG_FILE)) {
    logger.warn("Config already exists, not overwriting.");
    return;
  }

  // You can later replace this with proper interactive wizard.
  saveConfig(DEFAULT_CONFIG);
  logger.info("Config initialized at " + CONFIG_FILE);
}
