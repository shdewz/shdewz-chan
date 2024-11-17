const defaultPrefix = process.env.DEFAULT_PREFIX || '?';
const prefixes = [];

export const init = () => {
    // populate prefixes from db
    return;
}

export const updatePrefix = (guildId: string, prefix: string) => {
    return;
}

export const getPrefix = (guildId: string | null) => {
    if (guildId === null) return defaultPrefix;
    return defaultPrefix;
}