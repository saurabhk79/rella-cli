import { Command } from "commander";
import fs from "node:fs";
import type { TaskName } from "../../core/ai/TaskPresets.js";
import { runTask } from "../../core/ai/TaskEngine.js";

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

export function registerAiCommand(program: Command) {
  program
    .command("ai")
    .description("Run AI task pipeline")
    .argument("<task>", "Task name (analyze_logs | generate_commit_message | refactor_code | explain_code | generate_snippet)")
    .option("-f, --file <path>", "Input file instead of stdin")
    .allowExcessArguments(true)
    .action(async (task: string, options: { file?: string }, cmd: Command) => {
      const extraArgs = cmd.args.slice(1); // first arg is task
      const t = task as TaskName;

      let input = "";
      if (options.file) {
        input = fs.readFileSync(options.file, "utf8");
      } else {
        input = await readStdin();
      }

      if (!input.trim()) {
        // eslint-disable-next-line no-console
        console.error("No input provided (stdin or file).");
        process.exit(1);
      }

      const result = await runTask(t, {
        input,
        extraArgs,
        defaultContext: "" // overridden by config
      });

      process.stdout.write(result + "\n");
    });
}
