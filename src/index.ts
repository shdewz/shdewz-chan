import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';

import numeral from 'numeral';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
});

client.commands = new Collection();
require('./helpers/db').init();
require('./handlers/commandHandler').loadCommands(client);
require('./handlers/eventHandler').loadEvents(client);

client.login(process.env.TOKEN);
