import { Client, Message } from 'discord.js';
import { parseArgs } from '../../helpers/utils';
import { getUser } from 'src/helpers/osu';
import userSchema from '../../schemas/user'

const attributes = {
    name: 'set',
    group: 'account',
    aliases: ['set-preferences'],
    description: ''
}

export const execute = async (client: Client, message: Message, _args: string[], prefix: string) => {
    const args: any = parseArgs(_args.slice(1));

    if (args.osu) {
        const user: any = await getUser(args.osu, 'osu');
        if (!user) return message.reply(`**User \`${args.osu}\` not found!**`);

        const update = setPreference(message.author.id, { $set: { 'prefs.osu.user_id': user.id } });
        if (!update) return message.reply(`**Something went wrong updating your linked osu! account.**`);

        return message.reply({ embeds: [{ author: { name: `Successfully linked to osu! account ${user.username}!`, icon_url: `https://a.ppy.sh/${user.id || '1'}` || '' } }] });
    }
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

export const { name, aliases } = attributes;
