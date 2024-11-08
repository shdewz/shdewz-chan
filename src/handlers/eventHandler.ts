import { readdirSync, statSync } from 'fs';
import { Client } from 'discord.js';
import * as path from 'path';

const eventsDir = path.join(__dirname, '../events');

export const loadEvents = (client: Client) => {
    const files = readdirSync(eventsDir);

    for (const file of files) {
        const event = require(`${eventsDir}/${file}`);
        if (event.once) client.once(event.name, (...args) => event.execute(...cleanArgs(args, client)));
        else client.on(event.name, (...args) => event.execute(...cleanArgs(args, client)));
    }
}

const cleanArgs = (args: any[], client: Client) => [...new Set([client, ...args])];
