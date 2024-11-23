import { Client, Message } from 'discord.js';

export const attributes = {
    name: 'ping',
    group: 'General',
    aliases: [],
    description: '',
    params: []
};

export const execute = (_client: Client, message: Message, _args: string[], _prefix: string) => {
    message.reply(`${(Date.now() - message.createdTimestamp).toLocaleString()}ms :ping_pong:`);
};
