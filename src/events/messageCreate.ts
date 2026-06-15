import type { BotClient, Event } from '@/types';
import { Events, Message } from 'discord.js';
import { getPrefix } from '@/services/prefixService';

const messageCreate: Event<typeof Events.MessageCreate> = {
  name: Events.MessageCreate,
  once: false,
  execute: async (message: Message) => {
    if (message.author?.bot) return;

    const client = message.client as BotClient;
    const commands = client.commands;
    const aliases = client.aliases;

    const guildId = message.guild?.id ?? null;
    const prefix = await getPrefix(guildId);

    if (!message.content.startsWith(prefix)) return;

    const withoutPrefix = message.content.slice(prefix.length).trim();
    if (!withoutPrefix.length) return;

    const parts = withoutPrefix.split(/\s+/);
    const invoked = parts.shift()!.toLowerCase();
    const args = parts;

    let commandName = invoked;

    if (!commands.has(commandName) && aliases.has(commandName)) {
      commandName = aliases.get(commandName)!;
    }
    const cmd = commands.get(commandName);

    if (!cmd) return;

    try {
      await cmd.execute(message.client, { message, args, prefix, invoked });
    } catch (err) {
      console.error('Error executing command', commandName, err);
    }
  },
};

export default messageCreate;
