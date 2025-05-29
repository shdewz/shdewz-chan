import { Client, Message } from 'discord.js';
import { replyOptions } from '../../helpers/utils.js';

export const attributes = {
    name: 'help',
    group: 'General',
    aliases: ['commands'],
    description: 'Show help about commands',
    params: []
};

export const execute = (client: Client, message: Message, _args: string[], prefix: string) => {
    if (_args.slice(1).length === 0) {
        const commands = Array.from(client.commands).map(e => e[1]).filter(e => !e.alias && e.attributes.group !== 'dev');
        const groups = [...new Set(commands.map(c => c.attributes.group))].sort();

        const fields = [];
        for (const group of groups) {
            fields.push({
                name: group,
                value: commands.filter(c => c.attributes.group === group).map(c => `\`${c.attributes.name}\``).join(' '),
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
            }], ...replyOptions
        });
    }
    else {
        const command = client.commands.get(_args.slice(1).join('_'));
        if (!command) return message.reply({content: `🔻 No command found with the name **${_args.slice(1).join('_')}**.`, ...replyOptions});

        const fields = [];
        if (command.attributes.params.length > 0) {
            fields.push({ name: 'Arguments', value: `${command.attributes.params.map((e: any) => `> - \`-${e.name}\` • ${e.description}`).join('\n')}` });
        }
        if (command.attributes.aliases.length > 0) {
            fields.push({ name: 'Aliases', value: `> ${[...command.attributes.aliases, command.attributes.name].sort().map((e: string) => `\`${e}\``).join(' ')}` });
        }

        return message.reply({
            embeds: [{
                author: {
                    name: `${prefix}${command.attributes.name} • command help`,
                    icon_url: client.user?.avatarURL() ?? undefined,
                    url: undefined // replace with commands.md eventually
                },
                description: `${command.attributes.description.replace(/{{prefix}}/g, prefix)}`,
                fields: fields
            }], ...replyOptions
        });
    }
};
