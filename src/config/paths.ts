import os from "node:os";
import path from "node:path";

const PROJECT_NAME = "rella";

export const CONFIG_DIR = path.join(os.homedir(), `.${PROJECT_NAME}`);
export const RUNTIME_DIR = path.join(CONFIG_DIR, ".runtime");
export const LOGS_DIR = path.join(RUNTIME_DIR, "logs");
export const SESSIONS_DIR = path.join(CONFIG_DIR, "sessions");
export const TEMPLATES_DIR = path.join(CONFIG_DIR, "templates");
export const PLUGINS_DIR = path.join(CONFIG_DIR, "plugins");
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.toml");

export { PROJECT_NAME };
