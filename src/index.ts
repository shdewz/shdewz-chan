import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import * as db from './helpers/db.js';
import * as prefixHandler from './handlers/prefixHandler.js';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
});

client.commands = new Collection();
db.init();
prefixHandler.init();
loadCommands(client);
loadEvents(client);

client.login(process.env.ENV == 'production' ? process.env.TOKEN : process.env.TOKEN_DEV);
