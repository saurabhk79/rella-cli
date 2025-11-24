import { Command } from "commander";
import { loadConfig } from "../../config/ConfigService.js";
import { runShellCommand } from "../../core/command/CommandExecutor.js";

export function registerRunCommand(program: Command) {
  program
    .command("run")
    .description("Run a shell command safely")
    .argument("<cmd...>", "Shell command to run")
    .option("--dry", "Dry run (do not execute)")
    .action(async (cmdParts: string[], options: { dry?: boolean }) => {
      const cfg = loadConfig();
      const cmd = cmdParts.join(" ");
      const exitCode = await runShellCommand(cmd, cfg, { dryRun: !!options.dry });
      process.exit(exitCode);
    });
}
