import { Command } from "commander";
import {
  getConfigValue,
  initConfigWizard,
  openConfigInEditor,
  setConfigValue
} from "../../config/ConfigService.js";
import type { RellaConfig } from "../../config/ConfigTypes.js";

// helper so TS knows keys
const CONFIG_KEYS: Array<keyof RellaConfig> = [
  "api_key",
  "provider",
  "model",
  "log_level",
  "editor",
  "allowed_commands",
  "denied_commands",
  "default_context"
];

export function registerConfigCommand(program: Command) {
  const config = program.command("config").description("Manage RELLA configuration");

  config
    .command("get")
    .argument("<key>", "Config key")
    .action((key: string) => {
      if (!CONFIG_KEYS.includes(key as any)) {
        // eslint-disable-next-line no-console
        console.error("Unknown key");
        process.exit(1);
      }
      const value = getConfigValue(key as keyof RellaConfig);
      // eslint-disable-next-line no-console
      console.log(value);
    });

  config
    .command("set")
    .argument("<key>", "Config key")
    .argument("<value>", "Value")
    .action((key: string, value: string) => {
      if (!CONFIG_KEYS.includes(key as any)) {
        // eslint-disable-next-line no-console
        console.error("Unknown key");
        process.exit(1);
      }
      setConfigValue(key as keyof RellaConfig, value);
    });

  config
    .command("edit")
    .description("Open config in $EDITOR")
    .action(() => {
      openConfigInEditor();
    });

  config
    .command("init")
    .description("Initialize config with a simple wizard")
    .action(async () => {
      await initConfigWizard();
    });
}
