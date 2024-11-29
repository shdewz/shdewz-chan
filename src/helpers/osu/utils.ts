import { emotes, modes, modsEnum } from './constants.js';

export const noAccountSet = '**You have not linked your osu! account yet!**\nDo it with the command `{{prefix}}set -osu <user>`';

export const getEmote = (name: string) => { return emotes.find(r => r.name === name); };

const parseMode = (searchString: string) => {
    const _mode = modes.find(m => m.aliases.includes(searchString));
    return _mode?.mode || '';
};

export const getMode = (modeArg: string, command: string) => {
    if (modeArg) return parseMode(modeArg);
    else {
        if (!command) return 'osu';
        const commandMode = command.match(/(osu|taiko|fruits|catch|ctb|mania)/);
        return commandMode ? parseMode(commandMode[0]) : 'osu';
    }
};

export const getDisplayMode = (mode: string) => modes.find(m => m.aliases.includes(mode))?.display;

export const reverse_mods = (mods: string) => {
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
