import { Client, Message } from 'discord.js';

const attributes = {
    name: 'roll',
    group: 'General',
    aliases: [],
    description: '',
    params: []
}

export const { name, group, aliases, description, params } = attributes;

export const execute = (client: Client, message: Message, _args: string[], prefix: string) => {
    console.log(_args);
};
