import { Client, Message } from 'discord.js';
import { formatNum, getArgs } from '../../helpers/utils.js';
import userSchema from '../../schemas/user.js';
import { getEmote, getMode, guessFC, noAccountSet } from '../../helpers/osu/utils.js';
import { getBeatmap, getScores, getUser } from '../../helpers/osu/api.js';
import { perfCalc } from '../../helpers/osu/performance.js';

export const attributes = {
    name: 'score',
    group: 'osu!',
    aliases: ['sc', 'scores'],
    description: 'score.',
    params: [
        { name: 'beatmap <id>', description: 'Specify the beatmap.' },
        { name: 'sort <property>', description: 'Specify the sorting property.' },
        { name: 'reverse', description: 'Reverse the sort order.' }
    ]
};

export const execute = async (_client: Client, message: Message, _args: string[], prefix: string) => {
    const command = _args[0].toLowerCase();

    const args: any = getArgs(_args.slice(1));
    const userSettings = await userSchema.findOne({ user_id: message.author.id });

    const mode = getMode(args.mode, command);
    let userString = args._.join(' ');

    const beatmapID = args.beatmap || args.b || args.map;
    if (!beatmapID) return message.reply({ embeds: [{ description: '🔻 No beatmap ID specified!' }] });

    if (userString === '') {
        if (userSettings?.prefs?.osu?.user_id) userString = userSettings.prefs.osu.user_id;
        else return message.reply({ embeds: [{ description: noAccountSet.replace(/{{prefix}}/g, prefix) }] });
    }

    const sort = args.sort || args.s || 'pp';

    const embed: any = await getOsuScore(userString, beatmapID, mode, { prop: sort, reverse: !!args.reverse });

    message.reply({ embeds: [embed] });
};

export const getOsuScore = async (userID: string, beatmapID: string, mode: string, sort: any = { prop: 'pp', reverse: false }) => {
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
    const s = score.statistics;

    const isFc = guessFC(score, beatmap.max_combo);
    score.perf = await perfCalc(beatmap.id, score, isFc);

    const lines = [
        // {
        //     separator: ' • ', indent: '> ',
        //     content: [`🏅 **#${1} Personal Best**`]
        // },
        {
            separator: ' • ', indent: '> ',
            content: [
                score.best_id ?
                    `${getEmote(score.rank)?.emoji} **[+${score.mods.join('') || 'NM'}](https://osu.ppy.sh/scores/osu/${score.best_id})** (${formatNum(score.perf.max.difficulty.stars || 0, '0,0.00')}★)`
                    : `${getEmote(score.rank)?.emoji} **+${score.mods.join('') || 'NM'}** (${formatNum(score.perf.max.difficulty.stars || 0, '0,0.00')}★)`,
                formatNum(score.accuracy, '0.00%'),
                score.accuracy < 1 ? ` ${[
                    s.count_100 ? `**${s.count_100}** ${getEmote('hit100')?.emoji} ` : null,
                    s.count_50 ? `**${s.count_50}**${getEmote('hit50')?.emoji}` : null,
                    s.count_miss ? `**${s.count_miss}**${getEmote('miss')?.emoji}` : null,
                ].filter(e => e).join(' ')}` : null,
            ]
        },
        {
            separator: ' • ', indent: '> ',
            content: [
                `**${formatNum(score.pp, '0,0')}pp**${isFc ? '' : `/${formatNum(score.perf.fc?.pp || 0, '0,0')}pp`}`,
                `**${formatNum(score.max_combo, '0,0')}x**/${formatNum(beatmap.max_combo, '0,0')}x`,
                formatNum(score.score, '0,0')
            ]
        },
        {
            separator: ' • ', indent: '> ',
            content: [`Score set <t:${Math.round(new Date(score.created_at).valueOf() / 1000)}:R>`]
        },
        scores.length > 1 ? { separator: '', indent: '', content: ['\u200b'] } : null,
        scores.length > 1 ? { separator: '', indent: '', content: ['**Other scores:**'] } : null,
        ...scores.slice(1, Math.min(scores.length, 5)).map((sc: any) => ({
            separator: ' • ', indent: '> ',
            content: [
                sc.best_id ?
                    `${getEmote(sc.rank)?.emoji} **[+${sc.mods.join('') || 'NM'}](https://osu.ppy.sh/scores/osu/${sc.best_id})** ${formatNum(sc.pp, '0,0')}pp`
                    : `${getEmote(sc.rank)?.emoji} **+${sc.mods.join('') || 'NM'}** ${formatNum(sc.pp, '0,0')}pp`,
                `**${formatNum(sc.accuracy, '0.00%')}** ${formatNum(sc.max_combo, '0,0')}x${sc.statistics.count_miss ? ` **${sc.statistics.count_miss}**${getEmote('miss')?.emoji}` : ''}`,
                `<t:${Math.round(new Date(sc.created_at).valueOf() / 1000)}:R>`
            ]
        })),
        scores.length > 5 ? { separator: '', indent: '', content: [`**+${scores.length - 5} more**`] } : null,
    ];

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
            text: `${beatmap.beatmapset.status} (${beatmap.beatmapset.creator}, ${new Date(beatmap.beatmapset.ranked_date || beatmap.beatmapset.submitted_date).getFullYear()})`
        }
    };

    return embed;
};
