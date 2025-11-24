import inquirer from "inquirer";

export async function confirmPrompt(message: string): Promise<boolean> {
  const { ok } = await inquirer.prompt<{ ok: boolean }>([
    {
      type: "confirm",
      name: "ok",
      message,
      default: false
    }
  ]);
  return ok;
}
