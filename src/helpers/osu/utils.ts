import { emotes, modes, modsEnum } from './constants.js';

export const getEmote = (name: string) => { return emotes.find(r => r.name === name); };

const parseMode = (searchString: string) => {
    const _mode = modes.find(m => m.aliases.includes(searchString));
    return _mode?.mode || '';
};

export const getMode = (modeArg: string, command: string, shorthand: boolean = false) => {
    if (modeArg) return parseMode(modeArg);
    if (!command) return 'osu';
    const commandMode = command.match(shorthand ? /(t|c|m)$/ : /(osu|taiko|fruits|catch|ctb|mania)$/);
    return commandMode ? parseMode(commandMode[0]) : 'osu';
};

export const getDisplayMode = (mode: string) => modes.find(m => m.aliases.includes(mode))?.display;

export const reverseMods = (mods: string) => {
    if (!mods) return 0;
    let value = 0;
    const modsArray = mods.replace(/[^a-zA-z]/g, '').match(/.{2}/g);
    for (const mod of modsArray || []) {
        value += (modsEnum as any)[mod];
    }
    return value;
};

export const guessFC = (score: any, maxCombo: number) => {
    return score.max_combo > maxCombo * 0.998;
};

export const scoreCompletion = (hits: any, beatmap: any) => {
    const userHits = hits.count_300 + hits.count_100 + hits.count_50 + hits.count_miss;
    const maxHits = beatmap.count_circles + beatmap.count_sliders + beatmap.count_spinners;
    return userHits / maxHits;
};

export const getBeatmapDate = (beatmap: any) => new Date(beatmap.beatmapset.ranked_date || beatmap.beatmapset.submitted_date).getFullYear();
