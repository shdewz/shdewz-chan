import { setPrefix } from '@/services/prefixService';
import type { Command, CommandContext } from '@/types';
import { createInformationalEmbed } from '@/utils/embeds';
import { parseArgs } from '@/utils/parseArgs';
import { PermissionsBitField, type Client } from 'discord.js';

const MAX_PREFIX_LENGTH = 16;

export default {
  name: 'prefix',
  group: 'Management',
  description: 'Change the server prefix',
  aliases: ['setprefix'],
  execute: async (_client: Client, { message, args }: CommandContext) => {
    if (!message?.guild || !args) return;

    if (!message.member?.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return message.reply('Insufficient permissions.');

    const { positional } = parseArgs(args);
    const newPrefix = positional[0];

    if (!newPrefix) return message.reply('Please provide a prefix.');
    if (newPrefix.length > MAX_PREFIX_LENGTH)
      return message.reply(
        `Prefix must be ${MAX_PREFIX_LENGTH} characters or fewer.`,
      );

    try {
      await setPrefix(message.guild.id, newPrefix);
      return message.reply({
        embeds: [
          createInformationalEmbed(
            'success',
            `Prefix set to \`${newPrefix}\`.`,
          ),
        ],
      });
    } catch {
      return message.reply({
        embeds: [
          createInformationalEmbed(
            'error',
            'Failed to update prefix, please try again later.',
          ),
        ],
      });
    }
  },
} satisfies Command;
