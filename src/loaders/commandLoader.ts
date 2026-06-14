import path from 'path';
import type { Command } from '@/types';
import { walkDir } from '@/utils/fs';

export const loadCommands = async (
  dir = path.join(process.cwd(), 'src', 'commands'),
): Promise<{
  commands: Map<string, Command>;
  aliases: Map<string, string>;
}> => {
  const commands = new Map<string, Command>();
  const aliases = new Map<string, string>();

  for (const file of walkDir(dir)) {
    try {
      const mod = await import(`file://${file}`);
      const cmd: Command | undefined =
        mod.default && typeof mod.default.name === 'string'
          ? mod.default
          : undefined;

      if (!cmd) {
        console.warn('Skipping command (no default export):', file);
        continue;
      }

      commands.set(cmd.name, cmd);
      for (const alias of cmd.aliases ?? []) {
        if (!aliases.has(alias)) aliases.set(alias, cmd.name);
      }
    } catch (err) {
      console.warn('Failed to load command:', file, err);
    }
  }

  return { commands, aliases };
};
