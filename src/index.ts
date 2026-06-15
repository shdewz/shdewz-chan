import { Client, GatewayIntentBits } from 'discord.js';
import { loadCommands } from '@/loaders/commandLoader';
import { loadEvents } from '@/loaders/eventLoader';
import type { BotClient } from '@/types';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
}) as BotClient;

const { commands, aliases } = await loadCommands();
console.log(`Loaded ${commands.size} commands and ${aliases.size} aliases`);

(client as BotClient).commands = commands;
(client as BotClient).aliases = aliases;

await loadEvents(client);

void client.login(process.env.DISCORD_TOKEN);
