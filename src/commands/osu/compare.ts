import userSchema from '../../schemas/user.js';
import channelSchema from '../../schemas/channel.js';

import { Client, Message } from 'discord.js';
import { getArgs, replyOptions } from '../../helpers/utils.js';
import { getMode } from '../../helpers/osu/utils.js';
import { noAccountSet } from '../../helpers/osu/constants.js';
import { getOsuScore } from './score.js';

export const attributes = {
    name: 'compare',
    group: 'osu!',
    aliases: ['c'],
    hiddenAliases: ['gap'],
    description: 'compare score.',
    params: [
        { name: 'mode <osu/taiko/catch/mania>', description: 'Specify the gamemode. Defaults to the mode of the score that is being compared.' },
        { name: 'sort <property>', description: 'Specify the sorting property.' },
        { name: 'reverse', description: 'Reverse the sort order.' }
    ]
};

export const execute = async (_client: Client, message: Message, _args: string[], prefix: string) => {
    const args: any = getArgs(_args.slice(1));
    const userSettings = await userSchema.findOne({ user_id: message.author.id });

    let userString = args._.join(' ');
    if (userString === '') {
        if (userSettings?.prefs?.osu?.user_id) userString = userSettings.prefs.osu.user_id;
        else return message.reply({ embeds: [{ description: noAccountSet.replace(/{{prefix}}/g, prefix) }], ...replyOptions });
    }

    const channelSettings = await channelSchema.findOne({ channel_id: message.channel.id });
    if (!channelSettings?.last_beatmap?.id) return message.reply({ embeds: [{ description: '🔻 No recent beatmaps found in this channel.' }], ...replyOptions });

    const mode = getMode(args.mode || args.m || channelSettings.last_beatmap.mode, '');
    const beatmapID = channelSettings.last_beatmap.id;

    const sort = args.sort ?? args.s ?? 'pp';

    const embed: any = await getOsuScore(userString, beatmapID, mode, { prop: sort, reverse: !!args.reverse }, true, message.channel.id);

    message.reply({ embeds: [embed], ...replyOptions });
};
