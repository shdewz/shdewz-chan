import type { ArgSchema } from '@/utils/parseArgs';
import type {
  Client,
  ClientEvents,
  Message,
  CommandInteraction,
} from 'discord.js';
import type { ParsedArgs } from '@/utils/parseArgs';

export type BotClient = {
  commands: Map<string, Command>;
  aliases: Map<string, string>;
} & Client;

export type CommandContext = {
  message?: Message;
  interaction?: CommandInteraction;
  args?: string[];
  parsed?: ParsedArgs;
  prefix?: string;
  invoked?: string;
};

export type Command = {
  name: string;
  description?: string;
  aliases?: string[];
  prefixable?: boolean;
  group?: string;
  schema?: ArgSchema;
  execute: (
    client: Client,
    context: CommandContext,
  ) => Promise<void | Message> | void | Message;
};

export type Event<K extends keyof ClientEvents> = {
  name: K;
  once?: boolean;
  execute(...args: ClientEvents[K]): Promise<void> | void;
};
