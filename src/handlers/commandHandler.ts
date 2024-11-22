import { readdirSync, statSync } from 'fs';
import { Client } from 'discord.js';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandsDir = path.join(__dirname, '../commands');

export const loadCommands = async (client: Client) => {
    const commands = readdir(commandsDir, client);
    await importCommands(commands, client);
    console.log(`Successfully loaded ${client.commands.size} commands and aliases`);
}

const commandFiles: string[] = [];

const readdir = (path: string = commandsDir, client: Client) => {
    const files = readdirSync(path);
    for (const file of files) {
        const filePath = `${path}/${file}`;
        if (statSync(filePath).isDirectory()) {
            readdir(filePath, client);
            continue;
        }

        try {
            const fileUrl = pathToFileURL(filePath).href;
            commandFiles.push(fileUrl);
        }
        catch (error) { console.error(error); }
    }
    return commandFiles;
}

const importCommands = async (commmandFiles: string[], client: Client) => {
    for (const commandFile of commmandFiles) {
        const command = await import(commandFile);

        client.commands.set(command.name, command);

        for (const alias of command.aliases || []) {
            client.commands.set(alias, { ...command, alias: true });
        }
    }
}