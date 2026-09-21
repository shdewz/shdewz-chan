import * as osu from 'osu-api-v2-js';

import { api } from '@/lib/osu/api/client';
import { MODE_RULESET_MAP } from '@/lib/osu/constants/modes';

const normalizeUserLookup = (value: string): string | number => {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
};

export const getProfile = async (
  username: string,
  mode?: keyof typeof osu.Ruleset,
): Promise<osu.User.Extended> =>
  api.getUser(
    normalizeUserLookup(username),
    mode ? MODE_RULESET_MAP[mode] : undefined,
  );
