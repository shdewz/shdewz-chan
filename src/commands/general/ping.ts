import { Client, Message } from 'discord.js';
import { parseArgs } from '../../helpers/utils';

const attributes = {
    name: 'ping',
    aliases: []
}

export const execute = (client: Client, message: Message, _args: string[]) => {
    message.reply(`${(Date.now() - message.createdTimestamp).toLocaleString()}ms :ping_pong:`);
};

export const { name, aliases } = attributes;
