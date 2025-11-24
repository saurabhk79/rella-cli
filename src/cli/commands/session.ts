import { Command } from "commander";
import {
  deleteSession,
  listSessions,
  loadSession,
  newSession
} from "../../core/ai/SessionManager.js";

// These commands are about session files, not yet tied to AI chat loop.
// You can extend later.

export function registerSessionCommands(program: Command) {
  const session = program.command("session").description("Manage RELLA sessions");

  session
    .command("new")
    .argument("<name>", "Session name")
    .action((name: string) => {
      newSession(name);
      // eslint-disable-next-line no-console
      console.log(`Session '${name}' created.`);
    });

  session
    .command("load")
    .argument("<name>", "Session name")
    .action((name: string) => {
      const s = loadSession(name);
      if (!s) {
        // eslint-disable-next-line no-console
        console.error("Session not found.");
        process.exit(1);
      }
      // For now just dump; later you can use this in an interactive chat.
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(s, null, 2));
    });

  session
    .command("list")
    .action(() => {
      const names = listSessions();
      for (const n of names) {
        // eslint-disable-next-line no-console
        console.log(n);
      }
    });

  session
    .command("delete")
    .argument("<name>", "Session name")
    .action((name: string) => {
      deleteSession(name);
      // eslint-disable-next-line no-console
      console.log(`Session '${name}' deleted (if it existed).`);
    });
}
