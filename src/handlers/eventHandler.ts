import { readdirSync } from 'fs';
import { Client } from 'discord.js';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsDir = path.join(__dirname, '../events');

export const loadEvents = async (client: Client) => {
    const files = readdirSync(eventsDir);

    for (const file of files) {
        const fileUrl = pathToFileURL(`${eventsDir}/${file}`).href;
        const event = await import(fileUrl);
        if (event.once) client.once(event.name, (...args) => event.execute(...cleanArgs(args, client)));
        else client.on(event.name, (...args) => event.execute(...cleanArgs(args, client)));
    }
};

const cleanArgs = (args: any[], client: Client) => [...new Set([client, ...args])];
