import type { BotClient, Command, CommandContext } from '@/types';
import type { Client } from 'discord.js';

export default {
  name: 'help',
  group: 'General',
  description: 'Help',
  execute: async (_client: Client, { message }: CommandContext) => {
    if (!message) return;

    const botClient = _client as BotClient;
    const commands = [...botClient.commands.values()];

    const groups = [...new Set(commands.map((c) => c.group))];
    const fields: { name: string; value: string }[] = [];

    for (const group of groups) {
      const groupCommands = commands.filter((c) => c.group === group);
      fields.push({
        name: group ?? 'Misc',
        value: groupCommands.map((c) => `\`${c.name}\``).join(' '),
      });
    }

    return message.reply({
      embeds: [
        {
          author: {
            icon_url: botClient.user?.avatarURL() ?? undefined,
            name: 'List of available commands:',
          },
          fields,
        },
      ],
    });
  },
} satisfies Command;
