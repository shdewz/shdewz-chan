import { formatNum } from '../utils.js';
import { getEmote, guessFC, scoreCompletion } from './utils.js';
import { separator } from './constants.js';
import { perfCalc } from './performance.js';

export const formatScore = async (scores: any[], beatmap: any, isRecent: boolean, includeOthers: boolean = false) => {
    const score = scores[0];
    const s = score.statistics;
    const isFc = guessFC(score, beatmap);
    const perf = await perfCalc(beatmap.id, score, isFc);

    const _lines = [
        // {
        //     separator: ' • ', indent: '> ',
        //     content: [`🏅 **#${1} Personal Best**`]
        // },
        {
            separator, indent: '> ',
            content: [
                score.best_id ?
                    `${getEmote(score.rank)?.emoji} **[+${score.mods.join('') || 'NM'}](https://osu.ppy.sh/scores/osu/${score.best_id})** (${formatNum(perf?.max.difficulty.stars || 0, '0,0.00')}★)`
                    : `${getEmote(score.rank)?.emoji} **+${score.mods.join('') || 'NM'}** (${formatNum(perf?.max.difficulty.stars || 0, '0,0.00')}★)`,
                formatNum(score.accuracy, '0.00%'),
                score.accuracy < 1 ? ` ${[
                    s.count_100 ? `**${s.count_100}** ${getEmote('hit100')?.emoji} ` : null,
                    s.count_50 ? `**${s.count_50}**${getEmote('hit50')?.emoji}` : null,
                    s.count_miss ? `**${s.count_miss}**${getEmote('miss')?.emoji}` : null,
                ].filter(e => e).join(' ')}` : null,
            ]
        },
        {
            separator, indent: '> ',
            content: [
                `**${formatNum(score.pp || perf?.current.pp || 0, '0,0')}pp**${isFc ? '' : `/${formatNum(perf?.fc?.pp || 0, '0,0')}pp`}`,
                `**${formatNum(score.max_combo, '0,0')}x**/${formatNum(beatmap.max_combo, '0,0')}x`,
                formatNum(score.score, '0,0')
            ]
        },
        isRecent ? {
            separator, indent: '> ',
            content: [
                score.rank === 'F' ? `**${formatNum(scoreCompletion(s, beatmap), '0%')}** completion` : null,
            ]
        } : null,
        {
            separator, indent: '> ',
            content: [`Score set <t:${Math.round(new Date(score.created_at).valueOf() / 1000)}:R>`]
        }
    ];

    const lines = !includeOthers ? _lines : _lines.concat([
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
        scores.length > 5 ? { separator: '', indent: '', content: [`**+${scores.length - 5} more**`] } : null
    ]);

    return lines;
};
