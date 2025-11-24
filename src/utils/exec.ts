import { execa } from "execa";

export interface ExecResult {
  code: number;
  stdout: string;
  stderr: string;
}

export async function execCommand(cmd: string, shell = true): Promise<ExecResult> {
  try {
    const child = await execa(cmd, {
      shell,
      stdout: "pipe",
      stderr: "pipe"
    });
    return {
      code: child.exitCode ?? 0,
      stdout: child.stdout,
      stderr: child.stderr
    };
  } catch (e: any) {
    return {
      code: e.exitCode ?? 1,
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? e.message ?? ""
    };
  }
}
