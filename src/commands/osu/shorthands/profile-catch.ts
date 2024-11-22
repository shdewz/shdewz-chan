import { Client, Message } from 'discord.js';
import { getArgs } from '../../../helpers/utils.js';
import userSchema from '../../../schemas/user.js'
import { getOsuProfile } from '../profile.js';

const attributes = {
    name: 'catch',
    group: 'shorthand',
    aliases: ['ctb', 'fruits'],
    description: `Shorthand for \`{{prefix}}osu -mode catch\`.`,
    params: []
}

export const { name, group, aliases, description, params } = attributes;

export const execute = async (client: Client, message: Message, _args: string[], prefix: string) => {
    const args: any = getArgs(_args.slice(1));
    const userSettings = await userSchema.findOne({ user_id: message.author.id });

    let userString = args._.join(' ');

    if (userString === '') {
        if (userSettings?.prefs?.osu?.user_id) userString = userSettings.prefs.osu.user_id;
        else return message.reply({ embeds: [{ description: `**You have not linked your osu! account yet!**\nDo it with the command \`${prefix}set -osu <user>\`` }] });
    }

    const embed = await getOsuProfile(userString, 'fruits');

    message.reply({ embeds: [embed] });
};