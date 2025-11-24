import { Command } from "commander";
import { discoverPlugins, runPluginCommand } from "../../plugins/PluginLoader.js";

export function registerPluginCommands(program: Command) {
  const pluginsCmd = program.command("plugins").description("Manage and run plugins");

  pluginsCmd
    .command("list")
    .description("List discovered plugins and their commands")
    .action(() => {
      const plugins = discoverPlugins();
      if (plugins.length === 0) {
        // eslint-disable-next-line no-console
        console.log("No plugins found.");
        return;
      }
      for (const p of plugins) {
        // eslint-disable-next-line no-console
        console.log(`Plugin: ${p.manifest.name}`);
        for (const c of p.manifest.commands) {
          // eslint-disable-next-line no-console
          console.log(`  - ${c.name}: ${c.description ?? ""}`);
        }
      }
    });

  // Dynamic runner: rella plugin <plugin-name> <command> [args...]
  pluginsCmd
    .command("run")
    .argument("<plugin>", "Plugin name")
    .argument("<command>", "Command name")
    .allowExcessArguments(true)
    .action((pluginName: string, commandName: string, cmd: Command) => {
      const args = cmd.args.slice(2);
      const plugins = discoverPlugins();
      const plugin = plugins.find(p => p.manifest.name === pluginName);
      if (!plugin) {
        // eslint-disable-next-line no-console
        console.error("Plugin not found");
        process.exit(1);
      }
      const exitCode = runPluginCommand(plugin, commandName, args);
      process.exit(exitCode);
    });
}
