import { getDisplayMode, getEmote } from '@/lib/osu/utils';
import {
  blank,
  embedLine,
  timestamp,
  formatCompactNumber,
  formatNumber,
  formatRank,
  formatCountryFlag,
  formatProfileUrl,
} from '@/lib/osu/format';
import type { OsuMode } from '@/lib/osu/types/common';
import type { OsuProfile, OsuProfileStatistics } from '@/lib/osu/types/profile';
import type { APIEmbed } from 'discord.js';
import { pluralize } from '@/utils/general';
import { getFlag } from '@/utils/icons';

const displayGradeRanks = [
  { label: 'SSH', key: 'ssh' },
  { label: 'SS', key: 'ss' },
  { label: 'SH', key: 'sh' },
  { label: 'S', key: 's' },
  { label: 'A', key: 'a' },
] as const;

const buildDescription = (
  profile: OsuProfile,
  statistics: OsuProfileStatistics,
) => {
  const lines: Array<string | null> = [
    // global rank | country rank
    embedLine(
      formatRank(statistics.global_rank),
      `${formatCountryFlag(profile.country_code)} ${formatRank(statistics.country_rank)}`,
    ),

    // pp | accuracy
    embedLine(
      statistics.pp ? `**${formatNumber(statistics.pp)}**pp` : null,
      `**${statistics.hit_accuracy.toFixed(2)}%** accuracy`,
    ),

    // level | medals
    embedLine(
      `level **${statistics.level.current}.${statistics.level.progress}**`,
      `**${profile.user_achievements.length}** medals`,
    ),

    // badges | first places
    profile.badges.length === 0 && profile.scores_first_count === 0
      ? null
      : embedLine(
          profile.badges.length > 0
            ? `**${profile.badges.length}** badge${pluralize(profile.badges.length)}`
            : null,
          profile.scores_first_count > 0
            ? `**${formatNumber(profile.scores_first_count)}** first place${pluralize(profile.scores_first_count)}`
            : null,
        ),

    // peak rank
    statistics.global_rank
      ? embedLine(
          `peak **#${formatNumber(profile.rank_highest?.rank ?? statistics.global_rank)}**` +
            (profile.rank_highest?.updated_at
              ? ' ' + timestamp(profile.rank_highest.updated_at, 'R')
              : null),
        )
      : null,

    blank,

    // playcount | hours | hits per play
    embedLine(
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

    // ranked score | total score
    embedLine(
      `**${formatCompactNumber(statistics.ranked_score)}** ranked score`,
      `**${formatCompactNumber(statistics.total_score)}** total score`,
    ),

    // ranked sets
    profile.ranked_beatmapset_count === 0
      ? null
      : embedLine(
          `**${profile.ranked_beatmapset_count}** ranked map${pluralize(profile.ranked_beatmapset_count)}`,
        ),

    // loved sets
    profile.loved_beatmapset_count === 0
      ? null
      : embedLine(
          `**${profile.loved_beatmapset_count}** loved map${pluralize(profile.loved_beatmapset_count)}`,
        ),

    // guest diffs
    profile.guest_beatmapset_count === 0
      ? null
      : embedLine(
          `**${profile.guest_beatmapset_count}** guest diff${pluralize(profile.guest_beatmapset_count)}`,
        ),

    // rank counts
    embedLine(
      ...displayGradeRanks.map(({ label, key }) => {
        const count = statistics.grade_counts[key];
        return `${getEmote(label)?.emoji} **${count}**`;
      }),
    ),

    blank,

    // join date | online status
    embedLine(
      `joined ${timestamp(profile.join_date, 'R')}`,
      profile.is_online
        ? 'currently online'
        : profile.last_visit
          ? `last seen ${timestamp(profile.last_visit, 'R')}`
          : null,
    ),

    // socials
    profile.twitter || profile.discord
      ? embedLine(
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
