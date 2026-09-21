import type { Client } from 'discord.js';

let emoteMap: Map<string, string> = new Map();

export const loadAppEmotes = async (client: Client) => {
  const appEmojis = await client.application!.emojis.fetch();
  emoteMap = new Map(appEmojis.map((e) => [e.name!, e.toString()]));
};

export const getEmote = (name: string | undefined): string => {
  return (name && emoteMap.get(name)) ?? `:${name}:`;
};
