import { Client, Message } from 'discord.js';

const attributes = {
    name: 'ping',
    group: 'General',
    aliases: [],
    description: '',
    params: []
}

export const { name, group, aliases, description, params } = attributes;

export const execute = (client: Client, message: Message, _args: string[], prefix: string) => {
    message.reply(`${(Date.now() - message.createdTimestamp).toLocaleString()}ms :ping_pong:`);
};
