import { createProvider } from "../../ai/providers/index.js";
import { buildMessagesForTask, type TaskName } from "./TaskPresets.js";
import type { TaskContext } from "./TaskPresets.js";
import { loadConfig } from "../../config/ConfigService.js";

export async function runTask(
  task: TaskName,
  ctx: TaskContext,
  opts?: { stream?: boolean; onToken?: (t: string) => void },
): Promise<string> {
  const cfg = loadConfig();
  const provider = createProvider(cfg);
  const messages = buildMessagesForTask(task, {
    ...ctx,
    defaultContext: cfg.default_context,
  });

  return provider.complete(messages, opts);
}
