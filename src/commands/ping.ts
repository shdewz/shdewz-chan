import type { Command, CommandContext } from '@/types';
import type { Client, TextChannel } from 'discord.js';

export default {
  name: 'ping',
  group: 'General',
  description: 'Simple ping command',
  execute: async (_client: Client, { message }: CommandContext) => {
    if (!message) return;
    const msg = await (message.channel as TextChannel).send('...');
    await msg.delete();
    return message.reply(
      `:ping_pong: **${(msg.createdTimestamp - message.createdTimestamp).toLocaleString()}**ms`,
    );
  },
} satisfies Command;
