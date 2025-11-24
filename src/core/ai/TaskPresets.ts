import { loadUserTemplate } from "../../ai/templates/TemplateLoader.js";
import type { AIMessage } from "../../ai/providers/index.js";

export type TaskName =
  | "analyze_logs"
  | "generate_commit_message"
  | "refactor_code"
  | "explain_code"
  | "generate_snippet";

export interface TaskContext {
  input: string; // from stdin or file
  extraArgs: string[]; // unused for now
  defaultContext: string;
}

export function buildMessagesForTask(
  task: TaskName,
  ctx: TaskContext
): AIMessage[] {
  const userTemplate = loadUserTemplate(task);
  const baseSystem =
    ctx.defaultContext || "You are a helpful CLI coding assistant.";

  if (userTemplate) {
    const content = userTemplate
      .replace("{{input}}", ctx.input)
      .replace("{{extra_args}}", ctx.extraArgs.join(" "));
    return [
      { role: "system", content: baseSystem },
      { role: "user", content },
    ];
  }

  switch (task) {
    case "analyze_logs":
      return [
        { role: "system", content: baseSystem },
        {
          role: "user",
          content:
            "Analyze the following logs for errors, warnings, and likely root causes. Provide concise bullet points and recommendations.\n\n" +
            ctx.input,
        },
      ];
    case "generate_commit_message":
      return [
        { role: "system", content: baseSystem },
        {
          role: "user",
          content:
            "Generate a conventional commit message from this diff or description:\n\n" +
            ctx.input,
        },
      ];
    case "refactor_code":
      return [
        { role: "system", content: baseSystem },
        {
          role: "user",
          content:
            "Refactor this code to be cleaner, more idiomatic, and easier to maintain. Explain the key changes briefly.\n\n" +
            ctx.input,
        },
      ];
    case "explain_code":
      return [
        { role: "system", content: baseSystem },
        {
          role: "user",
          content:
            "Explain what this code does, step by step, and highlight potential issues.\n\n" +
            ctx.input,
        },
      ];
    case "generate_snippet":
      return [
        { role: "system", content: baseSystem },
        {
          role: "user",
          content:
            "Generate a code snippet that satisfies the following description. Include comments where useful.\n\n" +
            ctx.input,
        },
      ];
    default:
      throw new Error(`Unknown task: ${task satisfies never}`);
  }
}
