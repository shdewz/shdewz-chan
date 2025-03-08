import { Client, Message, PermissionsBitField } from 'discord.js';
import { updatePrefix } from '../../handlers/prefixHandler.js';
import { getArgs } from '../../helpers/utils.js';

export const attributes = {
    name: 'prefix',
    group: 'General',
    aliases: [],
    description: 'Change the server\'s command prefix',
    params: []
};

export const execute = async (_client: Client, message: Message, _args: string[], _prefix: string) => {
    if (!message.guild) return;

    const args: any = getArgs(_args.slice(1));
    if (args._[0]) {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) message.reply({ embeds: [{ description: '🔻 Insufficient permissions to change the server prefix.' }] });

        const newPrefix = args._[0];
        const update = await updatePrefix(message.guild.id, newPrefix);
        if (update) {
            return message.reply({ embeds: [{ description: `Successfully changed the server prefix to \`${newPrefix}\`` }] });
        }
        else return message.reply({ embeds: [{ description: '🔻 Unknown error changing the server prefix.' }] });
    }
    else return message.reply({ embeds: [{ description: '🔻 No arguments provided.' }] });
};
