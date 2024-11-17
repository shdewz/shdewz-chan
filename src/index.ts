import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
});

client.commands = new Collection();
require('./helpers/db').init();
require('./handlers/commandHandler').loadCommands(client);
require('./handlers/eventHandler').loadEvents(client);

client.login(process.env.NODE_ENV == 'production' ? process.env.TOKEN : process.env.TOKEN_DEV);
