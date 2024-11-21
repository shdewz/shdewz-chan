import guildSchema from '../schemas/guild';

const defaultPrefix = process.env.DEFAULT_PREFIX || '?';
const prefixes: { guildId: string; prefix: string; }[] = [];

export const init = async () => {
    const guilds = await guildSchema.find();
    for (const guild of guilds) {
        if (guild.prefix) prefixes.push({ guildId: guild.guild_id, prefix: guild.prefix });
    }
    console.log(`Settings loaded for ${guilds.length} servers`);
}

export const updatePrefix = async (guildId: string, prefix: string) => {
    try {
        await guildSchema.findOneAndUpdate({ guild_id: guildId }, { prefix: prefix }, { upsert: true, new: true });
        const i = prefixes.findIndex(e => e.guildId === guildId);
        if (i === -1) prefixes.push({ guildId: guildId, prefix: prefix });
        else prefixes[i] = { guildId: guildId, prefix: prefix };
        return true;
    }
    catch (error) {
        return false;
    }
}

export const getPrefix = (guildId: string | null) => {
    if (guildId === null) return defaultPrefix;
    return prefixes.find(e => e.guildId === guildId)?.prefix ?? defaultPrefix;
}