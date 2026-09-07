import { getProfile } from '@/lib/osu/api/profile.ts';
import { buildProfileEmbed } from '@/lib/osu/embeds/profile.ts';
import { getMode } from '@/lib/osu/utils.js';
import type { Command, CommandContext } from '@/types';
import { parseArgs } from '@/utils/parseArgs';
import type { Client } from 'discord.js';

export default {
  name: 'profile',
  group: 'osu!',
  prefixable: true,
  description: 'Show an osu! profile',
  execute: async (
    _client: Client,
    { message, args, invoked }: CommandContext,
  ) => {
    if (!message) return;

    const { positional, options } = parseArgs(args ?? [], {
      options: ['mode', 'm'],
    });

    const username = positional.join(' ').trim();
    if (!username) {
      return message.reply('Usage: `profile <username>`');
    }

    const mode = getMode(options, invoked ?? '');
    const explicitMode =
      options.has('mode') || options.has('m') || invoked !== 'profile';
    const profile = await getProfile(username, explicitMode ? mode : undefined);

    return message.reply({
      embeds: [buildProfileEmbed(profile, explicitMode ? mode : undefined)],
    });
  },
} satisfies Command;
