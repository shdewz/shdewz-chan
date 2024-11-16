import { Client, Message } from 'discord.js';

const attributes = {
    name: 'mania',
    group: 'osu!',
    aliases: [],
    description: `Shorthand for \`{{prefix}}osu -mode mania\`.`,
    params: []
}

export const { name, group, aliases, description, params } = attributes;

export const execute = async (client: Client, message: Message, _args: string[], prefix: string) => {
    const args = [..._args, '-mode', 'mania'];
    client.commands.get('osu').execute(client, message, args, prefix);
};
