import fs from "node:fs";
import path from "node:path";
import { TEMPLATES_DIR } from "../../config/paths.js";
import { ensureDirSync } from "../../utils/fs.js";

export function loadUserTemplate(name: string): string | null {
  ensureDirSync(TEMPLATES_DIR);
  const file = path.join(TEMPLATES_DIR, `${name}.md`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}
