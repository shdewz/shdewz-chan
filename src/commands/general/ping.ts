import { Client, Message, TextChannel } from 'discord.js';

export const attributes = {
    name: 'ping',
    group: 'General',
    aliases: [],
    description: '',
    params: []
};

export const execute = async (_client: Client, message: Message, _args: string[], _prefix: string) => {
    const msg = await (message.channel as TextChannel).send('...');
    await msg.delete();
    message.reply(`:ping_pong: **${(msg.createdTimestamp - message.createdTimestamp).toLocaleString()}**ms`);
};
