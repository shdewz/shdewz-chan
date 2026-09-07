import { getGuildPrefixFromDb, setGuildPrefixInDb } from '@/db';

const DEFAULT_PREFIX = process.env.DEFAULT_PREFIX || '!';
const TTL = Number(process.env.PREFIX_CACHE_TTL_MS ?? 60 * 60 * 1000); // 60 min default

type CacheEntry = { prefix: string | null; expiresAt: number };

const cache = new Map<string, CacheEntry>();

export const getPrefix = async (guildId?: string | null): Promise<string> => {
  if (!guildId) return DEFAULT_PREFIX;

  const now = Date.now();
  const entry = cache.get(guildId);
  if (entry && entry.expiresAt > now) {
    return entry.prefix ?? DEFAULT_PREFIX;
  }

  try {
    const dbPrefix = await getGuildPrefixFromDb(guildId);
    const toCache: CacheEntry = {
      prefix: dbPrefix,
      expiresAt: Date.now() + TTL,
    };
    cache.set(guildId, toCache);
    return dbPrefix ?? DEFAULT_PREFIX;
  } catch (err) {
    console.warn('Failed to fetch prefix from DB for', guildId, err);
    return DEFAULT_PREFIX;
  }
};

export const setPrefix = async (
  guildId: string,
  prefix: string,
): Promise<void> => {
  await setGuildPrefixInDb(guildId, prefix);
  cache.set(guildId, { prefix, expiresAt: Date.now() + TTL });
};

export const invalidatePrefixCache = (guildId: string) => {
  cache.delete(guildId);
};
