import { existsSync, createWriteStream, readFileSync } from 'fs';
import * as https from 'https';
import * as rosu from 'rosu-pp-js';
import { reverseMods } from './utils.js';

const downloadBeatmap = async (beatmapID: string) => {
    if (existsSync(`cache/beatmaps/${beatmapID}.osu`)) return;
    return await new Promise((resolve, reject) => {
        https.get(`https://osu.ppy.sh/osu/${beatmapID}`, response => {
            const code = response.statusCode ?? 0;

            if (code >= 400) { return reject(new Error(response.statusMessage)); }

            const fileWriter = createWriteStream(`cache/beatmaps/${beatmapID}.osu`).on('finish', () => { resolve({}); });
            response.pipe(fileWriter);
        }).on('error', error => { reject(error); });
    });
};

export const diffCalc = async (beatmapID: string, mods: string[]) => {
    try {
        await downloadBeatmap(beatmapID);
        const beatmap = new rosu.Beatmap(readFileSync(`cache/beatmaps/${beatmapID}.osu`));
        const maxAttrs = new rosu.Performance({ mods: reverseMods(mods.join('')) }).calculate(beatmap);
        return maxAttrs;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};

export const perfCalc = async (beatmapID: string, score: any, fc: boolean) => {
    try {
        await downloadBeatmap(beatmapID);
        const beatmap = new rosu.Beatmap(readFileSync(`cache/beatmaps/${beatmapID}.osu`));
        const maxAttrs = new rosu.Performance({ mods: reverseMods(score.mods.join('')) }).calculate(beatmap);

        const hits = {
            n300: score.statistics.count_300,
            n100: score.statistics.count_100,
            n50: score.statistics.count_50,
            misses: score.statistics.count_miss,
        };

        const perf = new rosu.Performance({
            mods: reverseMods(score.mods.join('')),
            n300: hits.n300,
            n100: hits.n100,
            n50: hits.n50,
            misses: hits.misses,
            passedObjects: hits.n300 + hits.n100 + hits.n50 + hits.misses,
            combo: score.max_combo,
            lazer: false
        }).calculate(maxAttrs);

        const fc_perf = fc ? null : new rosu.Performance({
            mods: reverseMods(score.mods.join('')),
            n100: hits.n100,
            n50: hits.n50,
            misses: 0,
            hitresultPriority: rosu.HitResultPriority.BestCase,
            lazer: false
        }).calculate(maxAttrs);

        return { current: perf, max: maxAttrs, fc: fc_perf };
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
