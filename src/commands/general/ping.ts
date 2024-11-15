import { Client, Message } from 'discord.js';

const attributes = {
    name: 'ping',
    group: 'general',
    aliases: [],
    description: ''
}

export const execute = (client: Client, message: Message, _args: string[], prefix: string) => {
    message.reply(`${(Date.now() - message.createdTimestamp).toLocaleString()}ms :ping_pong:`);
};

export const { name, aliases } = attributes;
