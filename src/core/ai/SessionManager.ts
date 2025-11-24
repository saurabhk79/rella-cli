import fs from "node:fs";
import path from "node:path";
import { SESSIONS_DIR } from "../../config/paths.js";
import { ensureDirSync } from "../../utils/fs.js";

export interface SessionMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Session {
  name: string;
  createdAt: string;
  updatedAt: string;
  messages: SessionMessage[];
}

function sessionPath(name: string): string {
  return path.join(SESSIONS_DIR, `${name}.json`);
}

export function listSessions(): string[] {
  ensureDirSync(SESSIONS_DIR);
  return fs
    .readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => f.replace(/\.json$/, ""));
}

export function loadSession(name: string): Session | null {
  ensureDirSync(SESSIONS_DIR);
  const file = sessionPath(name);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const parsed = JSON.parse(raw) as Session;
  return parsed;
}

export function saveSession(session: Session) {
  ensureDirSync(SESSIONS_DIR);
  fs.writeFileSync(sessionPath(session.name), JSON.stringify(session, null, 2), "utf8");
}

export function newSession(name: string): Session {
  const now = new Date().toISOString();
  const session: Session = {
    name,
    createdAt: now,
    updatedAt: now,
    messages: []
  };
  saveSession(session);
  return session;
}

export function deleteSession(name: string) {
  ensureDirSync(SESSIONS_DIR);
  const file = sessionPath(name);
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}
