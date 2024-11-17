import { Client, Message } from 'discord.js';

const attributes = {
    name: 'catch',
    group: 'shorthand',
    aliases: ['ctb'],
    description: `Shorthand for \`{{prefix}}osu -mode catch\`.`,
    params: []
}

export const { name, group, aliases, description, params } = attributes;

export const execute = async (client: Client, message: Message, _args: string[], prefix: string) => {
    const args = [..._args, '-mode', 'catch'];
    client.commands.get('osu').execute(client, message, args, prefix);
};
