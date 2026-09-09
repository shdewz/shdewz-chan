import { getProfile } from '@/lib/osu/api/profile.ts';
import { buildProfileEmbed } from '@/lib/osu/embeds/profileEmbed';
import { getMode } from '@/lib/osu/utils.js';
import { getLinkedProfileLookup } from '@/services/osuUserService';
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
    { message, args, prefix, invoked }: CommandContext,
  ) => {
    if (!message) return;

    const { positional, options } = parseArgs(args ?? [], {
      options: ['mode', 'm'],
    });

    const username = positional.join(' ').trim();
    const lookup =
      username || (await getLinkedProfileLookup(message.author.id));

    if (!lookup) {
      return message.reply(
        `Usage: \`${prefix}profile <username>\`, or link an account with \`${prefix}setosu <username|id>\` first.`,
      );
    }

    const mode = getMode(options, invoked ?? '');
    const explicitMode =
      options.has('mode') || options.has('m') || invoked !== 'profile';
    const profile = await getProfile(lookup, explicitMode ? mode : undefined);

    return message.reply({
      embeds: [buildProfileEmbed(profile, explicitMode ? mode : undefined)],
    });
  },
} satisfies Command;
