import { Client, Message } from 'discord.js';
import { parseArgs } from '../../helpers/utils';
import { getUser } from 'src/helpers/osu';
import userSchema from '../../schemas/user'

const attributes = {
    name: 'set',
    group: 'Account',
    aliases: ['set-preferences'],
    description: 'Set various account preferences',
    params: [
        { name: `osu <username>`, description: `Link an osu! user to your account.` }
    ]
}

export const { name, group, aliases, description, params } = attributes;

export const execute = async (client: Client, message: Message, _args: string[], prefix: string) => {
    const args: any = parseArgs(_args.slice(1));

    const embeds = [];

    // osu username
    if (args.osu) {
        const user: any = await getUser(args.osu, 'osu');
        if (!user) return message.reply(`**User \`${args.osu}\` not found!**`);

        const update = setPreference(message.author.id, { $set: { 'prefs.osu.user_id': user.id } });
        if (!update) return message.reply(`**Something went wrong updating your linked osu! account.**`);

        embeds.push({ author: { name: `Successfully linked to osu! account ${user.username}!`, icon_url: `https://a.ppy.sh/${user.id || '1'}` || '' } });
    }

    return message.reply({ embeds: embeds.length > 0 ? embeds : [{ author: { name: 'No preferences selected!' } }] });
};

export const setPreference = async (user: string, update: any) => {
    try {
        await update_user({ user_id: user }, update);
        return true;
    }
    catch (error) {
        return false;
    }
}

const update_user = async (query: any, update: any) => await userSchema.findOneAndUpdate(query, update, { upsert: true, new: true });
