import { readdirSync, statSync } from 'fs';
import { Client } from 'discord.js';
import * as path from 'path';

const commandsDir = path.join(__dirname, '../commands');

export const loadCommands = (client: Client) => {
    readdir(commandsDir, client);
    console.log(`Successfully loaded ${client.commands.size} commands and aliases`);
}

const readdir = (path: string = commandsDir, client: Client) => {
    const files = readdirSync(path);
    for (const file of files) {
        const filePath = `${path}/${file}`;
        if (statSync(filePath).isDirectory()) {
            readdir(filePath, client);
            continue;
        }

        try {
            const command = require(filePath);
            client.commands.set(command.name, command);

            for (const alias of command.aliases || []) {
                client.commands.set(alias, { ...command, alias: true });
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}