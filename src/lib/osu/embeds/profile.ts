import { getDisplayMode, getEmote } from '@/lib/osu/utils.js';
import { blank, line, timestamp } from '@/lib/osu/format.js';
import type { OsuMode } from '@/lib/osu/constants.js';
import type {
  OsuProfile,
  OsuProfileStatistics,
} from '@/lib/osu/types/profile.ts';
import type { APIEmbed } from 'discord.js';
import { pluralize } from '@/utils/general';
import { getFlag } from '@/utils/icons';

const formatNumber = (value: number) => value.toLocaleString();

const formatCompactNumber = (value: number) => {
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

const formatRank = (rank: number | null) =>
  rank ? `**#${formatNumber(rank)}**` : null;

const formatProfileUrl = (profile: OsuProfile, mode?: OsuMode) =>
  `https://osu.ppy.sh/users/${profile.id}${mode ? `/${mode}` : ''}`;

const formatCountryFlag = (countryCode: string) =>
  `:flag_${countryCode.toLowerCase()}:`;

const buildDescription = (
  profile: OsuProfile,
  statistics: OsuProfileStatistics,
) => {
  const lines: Array<string | null> = [
    line(
      formatRank(statistics.global_rank),
      `${formatCountryFlag(profile.country_code)} ${formatRank(statistics.country_rank)}`,
    ),
    line(
      statistics.pp ? `**${formatNumber(statistics.pp)}**pp` : null,
      `**${statistics.hit_accuracy.toFixed(2)}%** accuracy`,
    ),
    line(
      `level **${statistics.level.current}.${statistics.level.progress}**`,
      `**${profile.user_achievements.length}** medals`,
    ),
    profile.badges.length === 0 && profile.scores_first_count === 0
      ? blank
      : line(
          profile.badges.length > 0
            ? `**${profile.badges.length}** badge${pluralize(profile.badges.length)}`
            : null,
          profile.scores_first_count > 0
            ? `**${formatNumber(profile.scores_first_count)}** first place${pluralize(profile.scores_first_count)}`
            : null,
        ),
    statistics.global_rank
      ? line(
          `peak **#${formatNumber(profile.rank_highest?.rank ?? statistics.global_rank)}**` +
            (profile.rank_highest?.updated_at
              ? ' ' + timestamp(profile.rank_highest.updated_at, 'R')
              : null),
        )
      : blank,
    blank,
    line(
      `**${formatNumber(statistics.play_count)}** playcount`,
      `**${formatNumber(Math.round(statistics.play_time / 60 / 60))}** hours`,
      `**${formatNumber(
        Math.round(
          ((statistics.count_300 ?? 0) +
            (statistics.count_100 ?? 0) +
            (statistics.count_50 ?? 0) +
            (statistics.count_miss ?? 0)) /
            Math.max(statistics.play_count, 1),
        ),
      )}** hits/play`,
    ),
    line(
      `**${formatCompactNumber(statistics.ranked_score)}** ranked score`,
      `**${formatCompactNumber(statistics.total_score)}** total`,
    ),
    profile.ranked_beatmapset_count === 0
      ? null
      : line(
          `**${profile.ranked_beatmapset_count}** ranked map${pluralize(profile.ranked_beatmapset_count)}`,
        ),
    profile.loved_beatmapset_count === 0
      ? null
      : line(
          `**${profile.loved_beatmapset_count}** loved map${pluralize(profile.loved_beatmapset_count)}`,
        ),
    profile.guest_beatmapset_count === 0
      ? null
      : line(
          `**${profile.guest_beatmapset_count}** guest diff${pluralize(profile.guest_beatmapset_count)}`,
        ),
    line(
      `${getEmote('XH')?.emoji} **${statistics.grade_counts.ssh}**`,
      `${getEmote('X')?.emoji} **${statistics.grade_counts.ss}**`,
      `${getEmote('SH')?.emoji} **${statistics.grade_counts.sh}**`,
      `${getEmote('S')?.emoji} **${statistics.grade_counts.s}**`,
      `${getEmote('A')?.emoji} **${statistics.grade_counts.a}**`,
    ),
    blank,
    line(
      `joined ${timestamp(profile.join_date, 'R')}`,
      profile.is_online
        ? 'currently online'
        : profile.last_visit
          ? `last seen ${timestamp(profile.last_visit, 'R')}`
          : null,
    ),
    profile.twitter || profile.discord
      ? line(
          profile.discord
            ? `${getEmote('discord')?.emoji} **${profile.discord}**`
            : null,
          profile.twitter
            ? `${getEmote('twitter')?.emoji} **[@${profile.twitter}](https://twitter.com/${profile.twitter})**`
            : null,
        )
      : null,
  ];

  return lines.filter((value): value is string => Boolean(value)).join('\n');
};

export const buildProfileEmbed = (
  profile: OsuProfile,
  mode?: OsuMode,
): APIEmbed => {
  const displayMode = getDisplayMode(mode ?? profile.playmode ?? 'osu');

  return {
    color: profile.profile_colour
      ? parseInt(profile.profile_colour.slice(1), 16)
      : undefined,
    author: {
      name: `${displayMode} profile for ${profile.username}`,
      icon_url: getFlag(profile.country_code),
      url: formatProfileUrl(profile, mode),
    },
    title: profile.title ?? '',
    description: buildDescription(profile, profile.statistics),
    thumbnail: {
      url: profile.avatar_url,
    },
  };
};
