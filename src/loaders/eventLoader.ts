import path from 'path';
import type { Client, ClientEvents } from 'discord.js';
import type { Event } from '@/types';
import { walkDir } from '@/utils/fs';

export const loadEvents = async (
  client: Client,
  dir = path.join(process.cwd(), 'src', 'events'),
): Promise<void> => {
  for (const file of walkDir(dir)) {
    try {
      const mod = await import(`file://${file}`);
      const ev: Event<keyof ClientEvents> | undefined = mod.default ?? mod;
      if (
        !ev ||
        typeof ev.name !== 'string' ||
        typeof ev.execute !== 'function'
      )
        continue;

      const name = ev.name as keyof ClientEvents;
      const listener = (...args: ClientEvents[typeof name]) =>
        void ev.execute(...args);

      if (ev.once) client.once(name, listener);
      else client.on(name, listener);
    } catch (err) {
      console.warn('Failed to load event:', file, err);
    }
  }
};
