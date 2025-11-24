import fs from "node:fs";
import path from "node:path";
import { LOGS_DIR } from "../config/paths.js";
import { ensureDirSync } from "./fs.js";
import type { LogLevel } from "../config/ConfigTypes.js";

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

let currentLevel: LogLevel = "info";

export function setLogLevel(level: LogLevel) {
  currentLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return levelOrder[level] >= levelOrder[currentLevel];
}

function logToFile(line: string) {
  ensureDirSync(LOGS_DIR);
  const file = path.join(LOGS_DIR, `${new Date().toISOString().slice(0, 10)}.log`);
  fs.appendFile(file, line + "\n", () => {});
}

export function log(level: LogLevel, message: string, meta?: unknown) {
  if (!shouldLog(level)) return;
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level.toUpperCase()}] ${message}` +
    (meta ? ` ${JSON.stringify(meta)}` : "");
  // console output for non-debug
  if (level !== "debug") {
    // eslint-disable-next-line no-console
    console.log(line);
  }
  logToFile(line);
}

export const logger = {
  debug: (msg: string, meta?: unknown) => log("debug", msg, meta),
  info: (msg: string, meta?: unknown) => log("info", msg, meta),
  warn: (msg: string, meta?: unknown) => log("warn", msg, meta),
  error: (msg: string, meta?: unknown) => log("error", msg, meta)
};
