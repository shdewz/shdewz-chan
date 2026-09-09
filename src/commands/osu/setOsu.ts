import { getProfile } from '@/lib/osu/api/profile.ts';
import { setLinkedOsuUser } from '@/services/osuUserService';
import type { Command, CommandContext } from '@/types';
import { type Client } from 'discord.js';

export default {
  name: 'setosu',
  group: 'osu!',
  description: 'Link an osu! account',
  aliases: ['osuset'],
  execute: async (_client: Client, { message, args }: CommandContext) => {
    if (!message) return;

    const lookupString = (args ?? []).join(' ').trim();
    if (!lookupString) {
      return message.reply('Usage: `setosu <username|id>`');
    }

    try {
      const profile = await getProfile(lookupString);
      await setLinkedOsuUser(message.author.id, profile.id, profile.username);

      return message.reply(
        `Linked osu! account: **${profile.username}** (ID: ${profile.id})`,
      );
    } catch (err) {
      console.error('Failed to link osu account', err);
      return message.reply(
        `Could not find an osu! account for \`${lookupString}\`.`,
      );
    }
  },
} satisfies Command;
