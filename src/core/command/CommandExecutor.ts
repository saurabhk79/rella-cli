import { execCommand } from "../../utils/exec.js";
import { logger } from "../../utils/logger.js";
import type { RellaConfig } from "../../config/ConfigTypes.js";
import { confirmPrompt } from "../../utils/prompts.js";
import { minimatch } from "minimatch";

export interface CommandRunOptions {
  dryRun?: boolean;
}

function isDenied(cmd: string, cfg: RellaConfig): boolean {
  const denied = cfg.denied_commands || [];
  for (const pattern of denied) {
    if (pattern && minimatch(cmd, pattern, { matchBase: true })) {
      return true;
    }
  }
  return false;
}

function isAllowed(cmd: string, cfg: RellaConfig): boolean {
  const allowed = cfg.allowed_commands || [];
  if (allowed.length === 0) return true;
  for (const pattern of allowed) {
    if (pattern && minimatch(cmd, pattern, { matchBase: true })) {
      return true;
    }
  }
  return false;
}

export async function runShellCommand(
  cmd: string,
  cfg: RellaConfig,
  options: CommandRunOptions = {}
): Promise<number> {
  if (isDenied(cmd, cfg)) {
    logger.error("Command is denied by configuration.");
    return 1;
  }
  if (!isAllowed(cmd, cfg)) {
    logger.error("Command is not in allowed_commands whitelist.");
    return 1;
  }

  // confirmation prompt
  const ok = await confirmPrompt(`Execute: "${cmd}" ?`);
  if (!ok) {
    logger.info("Command execution cancelled.");
    return 0;
  }

  if (options.dryRun) {
    logger.info("[DRY RUN] Would execute: " + cmd);
    return 0;
  }

  logger.info("Executing command: " + cmd);
  const result = await execCommand(cmd);

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.code !== 0) {
    logger.warn(`Command exited with code ${result.code}`);
  }

  return result.code;
}
