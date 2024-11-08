import 'dotenv/config';
import { Client, Message } from 'discord.js';

const attributes = {
    name: 'messageCreate',
    once: false
}

const PREFIX = process.env.DEFAULT_PREFIX || '?';

export const execute = (client: Client, message: Message) => {
    if (message.content?.startsWith(PREFIX)) {
        const args = message.content.slice(PREFIX.length).split(' ');
        const command = args[0];
        client.commands.get(command)?.execute(client, message, args);
    }
};

export const { name, once } = attributes;