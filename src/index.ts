import { Client, GatewayIntentBits } from 'discord.js';
import { loadCommands } from '@/loaders/commandLoader';
import { loadEvents } from '@/loaders/eventLoader';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
});

const { commands, aliases } = await loadCommands();
console.log(`Loaded ${commands.size} commands and ${aliases.size} aliases`);

(client as any).commands = commands;
(client as any).aliases = aliases;

await loadEvents(client);

client.login(process.env.DISCORD_TOKEN);
