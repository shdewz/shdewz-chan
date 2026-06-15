import { getMode } from '@/lib/osu/utils';
import type { Command, CommandContext } from '@/types';
import { parseArgs } from '@/utils/parseArgs';
import type { Client } from 'discord.js';

export default {
  name: 'profile',
  group: 'osu!',
  prefixable: true,
  description: 'Simple ping command',
  execute: async (_client: Client, { args, invoked }: CommandContext) => {
    const { options } = parseArgs(args ?? []);
    console.log(getMode(options, invoked ?? ''));
  },
} satisfies Command;
