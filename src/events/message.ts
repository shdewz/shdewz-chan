import 'dotenv/config';
import { Client, Message } from 'discord.js';
import { randomString } from 'src/helpers/utils';

const attributes = {
    name: 'messageCreate',
    once: false
}

const defaultPrefix = process.env.DEFAULT_PREFIX || '?';

export const execute = (client: Client, message: Message) => {
    const prefix = defaultPrefix;
    if (message.content?.startsWith(prefix)) {
        const newContent = randomString(message.content);
        const args = newContent.slice(prefix.length).split(' ');
        const command = args[0];
        try {
            client.commands.get(command)?.execute(client, message, args, prefix);
        }
        catch (error) {
            console.log(error);
            message.reply('Error running this command!');
        }
    }
};

export const { name, once } = attributes;