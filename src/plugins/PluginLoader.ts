import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { PLUGINS_DIR } from "../config/paths.js";
import { ensureDirSync } from "../utils/fs.js";

export interface PluginManifest {
  name: string;
  description?: string;
  version?: string;
  commands: Array<{
    name: string;
    description?: string;
    usage?: string;
  }>;
}

export interface LoadedPlugin {
  manifest: PluginManifest;
  path: string; // executable file
}

export function discoverPlugins(): LoadedPlugin[] {
  ensureDirSync(PLUGINS_DIR);
  const files = fs.readdirSync(PLUGINS_DIR);
  const plugins: LoadedPlugin[] = [];

  for (const file of files) {
    const full = path.join(PLUGINS_DIR, file);
    if (!fs.statSync(full).isFile()) continue;
    // assume executable script that prints JSON manifest when called with --manifest
    const result = spawnSync(full, ["--manifest"], { encoding: "utf8" });
    if (result.error || result.status !== 0) continue;

    try {
      const manifest = JSON.parse(result.stdout) as PluginManifest;
      plugins.push({ manifest, path: full });
    } catch {
      // ignore invalid plugins
    }
  }

  return plugins;
}

export function runPluginCommand(
  plugin: LoadedPlugin,
  commandName: string,
  args: string[]
): number {
  const result = spawnSync(plugin.path, [commandName, ...args], {
    stdio: "inherit"
  });
  return result.status ?? 1;
}
