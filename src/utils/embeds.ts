import type { APIEmbed } from 'discord.js';

const typeColors = {
  success: 0x6bf26f,
  warning: 0xf2c36b,
  error: 0xf26b6b,
} as const;

export const createInformationalEmbed = (
  type: keyof typeof typeColors,
  description: string,
): APIEmbed => ({
  color: typeColors[type],
  description,
});
