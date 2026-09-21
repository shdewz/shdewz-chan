import path from 'path';
import type { Command } from '@/types';
import { walkDir } from '@/utils/fs';
import {
  MODE_PREFIX_ALIASES,
  MODE_SUFFIX_ALIASES,
} from '@/lib/osu/constants/modes';

const registerPrefixedAliases = (
  cmdName: string,
  aliases: Map<string, string>,
) => {
  for (const prefix of MODE_PREFIX_ALIASES) {
    const alias = `${prefix}${cmdName}`;
    if (!aliases.has(alias)) aliases.set(alias, cmdName);
  }
  for (const suffix of MODE_SUFFIX_ALIASES) {
    const alias = `${cmdName}${suffix}`;
    if (!aliases.has(alias)) aliases.set(alias, cmdName);
  }
};

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

      if (cmd.prefixable) registerPrefixedAliases(cmd.name, aliases);

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
