#!/usr/bin/env node
import { Command } from "commander";
import { registerConfigCommand } from "./commands/config.js";
import { registerRunCommand } from "./commands/run.js";
import { registerAiCommand } from "./commands/ai.js";
import { registerSessionCommands } from "./commands/session.js";
import { registerPluginCommands } from "./commands/plugin.js";
import { registerUpdateCommand } from "./commands/update.js";
import { PROJECT_NAME } from "../config/paths.js";
import { loadConfig } from "../config/ConfigService.js";
import { setLogLevel } from "../utils/logger.js";

async function main() {
  // load config early to set log level
  try {
    const cfg = loadConfig();
    setLogLevel(cfg.log_level);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("Failed to load config:", e.message);
  }

  const program = new Command();

  program
    .name(PROJECT_NAME)
    .description("RELLa CLI AI assistant")
    .version("0.1.0");

  registerConfigCommand(program);
  registerRunCommand(program);
  registerAiCommand(program);
  registerSessionCommands(program);
  registerPluginCommands(program);
  registerUpdateCommand(program);

  await program.parseAsync(process.argv);
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
