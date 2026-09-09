import type { OsuMode } from '@/lib/osu/types/common';
import type { OsuProfile } from '@/lib/osu/types/profile';

export const sep = ' **•** ';

export const embedLine = (...parts: (string | null | undefined)[]): string =>
  '> ' + parts.filter(Boolean).join(sep);

export const timestamp = (
  date: string | Date,
  format: 'R' | 'D' = 'R',
): string => `<t:${Math.round(new Date(date).valueOf() / 1000)}:${format}>`;

export const blank = '\u200b';

export const formatNumber = (value: number) => value.toLocaleString();

export const formatCompactNumber = (value: number) => {
  const suffixes = [
    { threshold: 1_000_000_000_000, suffix: 'T' },
    { threshold: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, suffix: 'M' },
    { threshold: 1_000, suffix: 'K' },
  ];

  const suffix = suffixes.find(({ threshold }) => value >= threshold);
  if (!suffix) return formatNumber(value);

  const compactValue = Math.round((value / suffix.threshold) * 10) / 10;
  return `${compactValue}${suffix.suffix}`;
};

export const formatRank = (rank: number | null) =>
  rank ? `**#${formatNumber(rank)}**` : null;

export const formatProfileUrl = (profile: OsuProfile, mode?: OsuMode) =>
  `https://osu.ppy.sh/users/${profile.id}${mode ? `/${mode}` : ''}`;

export const formatCountryFlag = (countryCode: string) =>
  `:flag_${countryCode.toLowerCase()}:`;
