import userSchema from '../../schemas/user.js';

import { Client, Message } from 'discord.js';
import { formatNum, getArgs } from '../../helpers/utils.js';
import { getEmote, getMode, getBeatmapDate, updateChannelBeatmap } from '../../helpers/osu/utils.js';
import { getBeatmap, getScores, getUser } from '../../helpers/osu/api.js';
import { noAccountSet } from '../../helpers/osu/constants.js';
import { formatScore } from '../../helpers/osu/formatters.js';

export const attributes = {
    name: 'score',
    group: 'osu!',
    aliases: ['sc', 'scores'],
    hiddenAliases: ['sct', 'scc', 'scm'],
    description: 'score.',
    params: [
        { name: 'beatmap <id>', description: 'Specify the beatmap.' },
        { name: 'mode <osu/taiko/catch/mania>', description: 'Specify the gamemode. Defaults to the user\'s selected main gamemode.' },
        { name: 'sort <property>', description: 'Specify the sorting property.' },
        { name: 'reverse', description: 'Reverse the sort order.' }
    ]
};

export const execute = async (_client: Client, message: Message, _args: string[], prefix: string) => {
    const command = _args[0].toLowerCase();

    const args: any = getArgs(_args.slice(1));
    const userSettings = await userSchema.findOne({ user_id: message.author.id });

    const mode = getMode(args.mode || args.m, command, attributes.hiddenAliases.includes(command));
    let userString = args._.join(' ');

    const beatmapID = args.beatmap ?? args.b ?? args.map;
    if (!beatmapID) return message.reply({ embeds: [{ description: '🔻 No beatmap ID specified! Make sure to use the `-b` flag.' }] });

    if (userString === '') {
        if (userSettings?.prefs?.osu?.user_id) userString = userSettings.prefs.osu.user_id;
        else return message.reply({ embeds: [{ description: noAccountSet.replace(/{{prefix}}/g, prefix) }] });
    }

    const sort = args.sort ?? args.s ?? 'pp';

    const embed: any = await getOsuScore(userString, beatmapID, mode, { prop: sort, reverse: !!args.reverse }, true, message.channel.id);

    message.reply({ embeds: [embed] });
};

export const getOsuScore = async (userID: string, beatmapID: string, mode: string, sort: any = { prop: 'pp', reverse: false }, includeOthers: boolean, channelID: string) => {
    const user: any = await getUser(userID, mode);
    if (!user?.id) return { description: `🔻 **User \`${userID}\` not found!**` };

    const beatmap: any = await getBeatmap(beatmapID);
    if (!beatmap?.id) return { description: `🔻 **Beatmap \`${beatmapID}\` not found!**` };

    const _scores: any = await getScores(user.id, beatmapID, mode);
    if (_scores.error || _scores.scores.length === 0) {
        return { description: `🔻 **No scores found for [${user.username}](https://osu.ppy.sh/users/${user.id}) on [${beatmap.beatmapset.title} [${beatmap.version}]](https://osu.ppy.sh/b/${beatmap.id})**` };
    }

    const scores = _scores.scores.sort((a: any, b: any) => b[sort.prop] - a[sort.prop]);
    if (sort.reverse) scores.reverse();
    const score = scores[0];

    const lines = await formatScore(scores, beatmap, false, includeOthers);

    const embed = {
        color: getEmote(score.rank)?.color,
        title: `${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]`,
        url: `https://osu.ppy.sh/b/${beatmap.id}`,
        author: {
            name: `${user.username} (#${formatNum(user.statistics.global_rank, '0,0')})`,
            icon_url: `https://a.ppy.sh/${user.id}`,
            url: `https://osu.ppy.sh/users/${user.id}${mode === '' ? '' : `/${mode}`}`,
        },
        description: lines.filter(e => e !== null).map(line => line.indent + line.content.filter((e: any) => e).join(line.separator)).join('\n'),
        image: { url: beatmap.beatmapset.covers['cover'] },
        footer: {
            icon_url: `https://osu.ppy.sh/wiki/images/shared/status/${beatmap.beatmapset.status}.png`,
            text: `${beatmap.beatmapset.status} (${beatmap.beatmapset.creator}, ${getBeatmapDate(beatmap)})`
        }
    };

    updateChannelBeatmap(channelID, beatmap.id, mode);

    return embed;
};
