import 'dotenv/config';
import { Client, Message } from 'discord.js';
import { randomString } from '../helpers/utils.js';
import { getPrefix } from '../handlers/prefixHandler.js';

export const attributes = {
    name: 'messageCreate',
    once: false
};

export const execute = (client: Client, message: Message) => {
    const prefix = getPrefix(message.guild?.id ?? null);
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
