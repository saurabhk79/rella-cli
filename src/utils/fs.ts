import fs from "node:fs";
import path from "node:path";

export function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function fileExists(file: string): boolean {
  return fs.existsSync(file);
}

export function readFileSafe(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

export function writeFileSafe(file: string, content: string) {
  ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, content, "utf8");
}
