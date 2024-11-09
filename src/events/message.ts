import 'dotenv/config';
import { Client, Message } from 'discord.js';

const attributes = {
    name: 'messageCreate',
    once: false
}

const defaultPrefix = process.env.DEFAULT_PREFIX || '?';

export const execute = (client: Client, message: Message) => {
    const prefix = defaultPrefix;
    if (message.content?.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).split(' ');
        const command = args[0];
        client.commands.get(command)?.execute(client, message, args, prefix);
    }
};

export const { name, once } = attributes;