import { apiCall } from '@/lib/osu/api/client.ts';
import type { OsuMode } from '@/lib/osu/constants.js';
import type { OsuProfile } from '@/lib/osu/types/profile.ts';

const API_BASE_URL = 'https://osu.ppy.sh/api/v2';

export const getProfile = async (
  username: string,
  mode?: OsuMode,
): Promise<OsuProfile> => {
  const url = new URL(`${API_BASE_URL}/users/${encodeURIComponent(username)}`);
  if (mode) url.pathname += `/${mode}`;
  url.searchParams.set('key', 'username');
  return apiCall<OsuProfile>(url.toString());
};
