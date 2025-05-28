import { formatNum } from '../utils.js';
import { getEmote, guessFC, scoreCompletion } from './utils.js';
import { separator } from './constants.js';
import { perfCalc } from './performance.js';

export const formatScore = async (score: any, beatmap: any, recent: boolean) => {
    const s = score.statistics;
    const isFc = guessFC(score, beatmap);
    const perf = await perfCalc(beatmap.id, score, isFc);

    console.log({perf: perf?.current});

    const lines = [
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
        recent ? {
            separator, indent: '> ',
            content: [
                score.rank === 'F' ? `**${formatNum(scoreCompletion(s, beatmap), '0%')}** completion` : null,
            ]
        } : null,
        {
            separator, indent: '> ',
            content: [`Score set <t:${Math.round(new Date(score.created_at).valueOf() / 1000)}:R>`]
        },
    ];

    return lines;
};
