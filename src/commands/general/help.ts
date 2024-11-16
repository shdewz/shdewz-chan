import { Client, Message } from 'discord.js';

const attributes = {
    name: 'help',
    group: 'General',
    aliases: ['commands'],
    description: '',
    params: []
}

export const { name, group, aliases, description, params } = attributes;

export const execute = (client: Client, message: Message, _args: string[], prefix: string) => {
    if (_args.slice(1).length === 0) {
        const commands = Array.from(client.commands).map(e => e[1]).filter(e => !e.alias);
        const groups = [...new Set(commands.map(c => c.group))].sort();

        const fields = [];
        for (const group of groups) {
            fields.push({
                name: group,
                value: commands.filter(c => c.group === group).map(c => `\`${c.name}\``).join(' '),
                inline: true
            });
        }

        return message.reply({
            embeds: [{
                color: undefined,
                author: {
                    name: 'shdewz-chan commands list',
                    icon_url: client.user?.avatarURL() ?? undefined,
                    url: undefined // replace with commands.md eventually
                },
                description: `**Current prefix:** \`${prefix}\`\nType \`${prefix}help <command>\` for more information about specific commands.`,
                fields: fields
            }]
        });
    }
    else {
        const command = client.commands.get(_args.slice(1).join('_'));
        if (!command) return;

        const fields = [];
        if (command.params.length > 0) {
            fields.push({ name: 'Arguments', value: `> ${command.params.map((e: any) => `\`-${e.name}\`: ${e.description}`).join('\n')}` });
        }
        if (command.aliases.length > 0) {
            fields.push({ name: 'Aliases', value: `> ${[...command.aliases, command.name].sort().map((e: string) => `\`${e}\``).join(' ')}` });
        }

        return message.reply({
            embeds: [{
                author: {
                    name: `Help for ${prefix}${command.name}`,
                    icon_url: client.user?.avatarURL() ?? undefined,
                    url: undefined // replace with commands.md eventually
                },
                description: `${command.description}`,
                fields: fields
            }]
        });
    }
};
