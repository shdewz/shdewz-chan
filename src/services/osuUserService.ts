import { getUserOsuLinkFromDb, setUserOsuLinkInDb } from '@/db';

export const getLinkedOsuUser = async (
  userId: string,
): Promise<number | null> => {
  return getUserOsuLinkFromDb(userId);
};

export const getLinkedProfileLookup = async (
  userId: string,
  fallbackUsername?: string,
): Promise<string | null> => {
  const linked = await getLinkedOsuUser(userId);
  const trimmed = fallbackUsername?.trim();

  if (trimmed) return trimmed;
  if (linked != null) return String(linked);

  return null;
};

export const setLinkedOsuUser = async (
  userId: string,
  osuUserId: number,
): Promise<void> => {
  await setUserOsuLinkInDb(userId, osuUserId);
};
