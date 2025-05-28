import { Client, Message } from 'discord.js';
import userSchema from '../../schemas/user.js';
import { noAccountSet } from '../../helpers/osu/constants.js';
import { getDisplayMode, getEmote, getMode } from '../../helpers/osu/utils.js';
import { getArgs } from '../../helpers/utils.js';
import { getBeatmap, getRecentScores, getUser } from '../../helpers/osu/api.js';
import { formatScore } from '../../helpers/osu/formatters.js';

export const attributes = {
    name: 'recent',
    group: 'osu!',
    aliases: ['r', 'rs', 'recent-score'],
    description: 'new score.',
    params: []
};

export const execute = async (_client: Client, message: Message, _args: string[], prefix: string) => {
    const command = _args[0].toLowerCase();

    const args: any = getArgs(_args.slice(1));
    const userSettings = await userSchema.findOne({ user_id: message.author.id });

    const mode = getMode(args.mode, command);
    let userString = args._.join(' ');

    if (userString === '') {
        if (userSettings?.prefs?.osu?.user_id) userString = userSettings.prefs.osu.user_id;
        else return message.reply({ embeds: [{ description: noAccountSet.replace(/{{prefix}}/g, prefix) }] });
    }

    const pass = args.pass ?? args.ps ?? false;
    const index = args.index ?? args.i ?? 1;

    const embed: any = await getOsuRecentScore(userString, mode, !pass, index);

    message.reply({ embeds: [embed] });
};

export const getOsuRecentScore = async (userID: string, mode: string, includeFails: boolean = true, index: number = 1) => {
    const user: any = await getUser(userID, mode);
    if (!user?.id) return { description: `🔻 **User \`${userID}\` not found!**` };

    const _scores: any = await getRecentScores(user.id, mode, includeFails, index);
    if (_scores.length === 0) {
        return { description: `🔻 **No recent scores found for [${user.username}](https://osu.ppy.sh/users/${user.id})**` };
    }

    const score = _scores[Math.min(index - 1, _scores.length - 1)];

    const beatmap: any = await getBeatmap(score.beatmap.id);

    const lines = await formatScore(score, beatmap, true);

    const embed = {
        color: getEmote(score.rank)?.color,
        title: `${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]`,
        url: `https://osu.ppy.sh/b/${beatmap.id}`,
        author: {
            name: `Recent ${getDisplayMode(mode)} score for ${user.username}`,
            icon_url: `https://a.ppy.sh/${user.id}`,
            url: `https://osu.ppy.sh/users/${user.id}${mode === '' ? '' : `/${mode}`}`,
        },
        description: lines.filter(e => e !== null).map(line => line.indent + line.content.filter((e: any) => e).join(line.separator)).join('\n'),
        image: { url: beatmap.beatmapset.covers['cover'] },
        footer: {
            icon_url: `https://osu.ppy.sh/wiki/images/shared/status/${beatmap.beatmapset.status}.png`,
            text: `${beatmap.beatmapset.status} (${beatmap.beatmapset.creator}, ${new Date(beatmap.beatmapset.ranked_date || beatmap.beatmapset.submitted_date).getFullYear()})`
        }
    };

    return embed;
};
