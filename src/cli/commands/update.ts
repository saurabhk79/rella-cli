import { Command } from "commander";

// Self-update stub; you can later implement `npm install -g rella` etc.
export function registerUpdateCommand(program: Command) {
  program
    .command("update")
    .description("Update RELLA (stub)")
    .action(() => {
      // eslint-disable-next-line no-console
      console.log("Self-update not implemented yet. Update via your package manager.");
    });
}
