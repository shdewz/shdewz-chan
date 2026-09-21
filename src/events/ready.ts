import { loadAppEmotes } from '@/loaders/emoteLoader';
import type { Event } from '@/types';
import { Events, type Client } from 'discord.js';

const ready: Event<typeof Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client<true>) => {
    await loadAppEmotes(client);
    console.log(`Logged in as ${client.user?.tag}`);
  },
};

export default ready;
