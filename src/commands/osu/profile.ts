import type * as osu from 'osu-api-v2-js';

import { getProfile } from '@/lib/osu/api/profile.ts';
import {
  blank,
  embedLine,
  timestamp,
  formatCompactNumber,
  formatCountryFlag,
  formatNumber,
  formatProfileUrl,
  formatRank,
} from '@/lib/osu/format';
import { getDisplayMode, getOsuEmoteTemp } from '@/lib/osu/utils';
import { USER_GROUPS } from '@/lib/osu/constants/userGroups';
import { getMode } from '@/lib/osu/utils.js';
import { getEmote } from '@/loaders/emoteLoader';
import { getLinkedProfileLookup } from '@/services/osuUserService';
import type { Command, CommandContext } from '@/types';
import { parseArgs } from '@/utils/parseArgs';
import { pluralize } from '@/utils/general';
import { getFlag } from '@/utils/icons';
import type { APIEmbed, Client } from 'discord.js';

const displayGradeRanks = [
  { label: 'SSH', key: 'ssh' },
  { label: 'SS', key: 'ss' },
  { label: 'SH', key: 'sh' },
  { label: 'S', key: 's' },
  { label: 'A', key: 'a' },
] as const;

const buildProfileEmbed = (
  profile: osu.User.Extended,
  mode?: keyof typeof osu.Ruleset,
): APIEmbed => {
  const groups = profile.groups ?? [];
  const statistics = profile.statistics;
  const displayMode = getDisplayMode(mode ?? profile.playmode ?? 'osu');

  const description = [
    groups.length > 0
      ? embedLine(
          groups
            .map((group) =>
              getEmote(USER_GROUPS.find((g) => g.id === group.id)?.emoteName),
            )
            .join(' '),
        )
      : null,

    embedLine(
      formatRank(statistics.global_rank),
      `${formatCountryFlag(profile.country_code)} ${formatRank(statistics.country_rank)}`,
    ),

    embedLine(
      statistics.pp ? `**${formatNumber(Math.round(statistics.pp))}**pp` : null,
      `**${(statistics.accuracy * 100).toFixed(2)}%** accuracy`,
    ),

    embedLine(
      `level **${statistics.level.current}.${statistics.level.progress}**`,
      `**${profile.user_achievements.length}** medals`,
    ),

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

    statistics.global_rank
      ? embedLine(
          `peak **#${formatNumber(profile.rank_highest?.rank ?? statistics.global_rank)}**` +
            (profile.rank_highest?.updated_at
              ? ' ' + timestamp(new Date(profile.rank_highest.updated_at), 'R')
              : null),
        )
      : null,

    blank,

    embedLine(
      ...displayGradeRanks.map(({ label, key }) => {
        const count = statistics.grade_counts[key];
        return `${getOsuEmoteTemp(label)?.emote} **${count}**`;
      }),
    ),

    embedLine(
      `**${formatNumber(statistics.play_count)}** playcount`,
      `**${formatNumber(Math.round((statistics.play_time ?? 0) / 60 / 60))}** hours`,
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

    embedLine(
      `**${formatCompactNumber(statistics.ranked_score)}** ranked score`,
      `**${formatCompactNumber(statistics.total_score)}** total score`,
    ),

    profile.ranked_beatmapset_count === 0
      ? null
      : embedLine(
          `**${profile.ranked_beatmapset_count}** ranked mapset${pluralize(profile.ranked_beatmapset_count)}`,
        ),

    profile.loved_beatmapset_count === 0
      ? null
      : embedLine(
          `**${profile.loved_beatmapset_count}** loved mapset${pluralize(profile.loved_beatmapset_count)}`,
        ),

    profile.guest_beatmapset_count === 0
      ? null
      : embedLine(
          `**${profile.guest_beatmapset_count}** guest diff${pluralize(profile.guest_beatmapset_count)}`,
        ),

    blank,

    embedLine(
      `joined ${timestamp(new Date(profile.join_date), 'R')}`,
      profile.is_online
        ? 'currently online'
        : profile.last_visit
          ? `last seen ${timestamp(new Date(profile.last_visit), 'R')}`
          : null,
    ),

    profile.twitter || profile.discord
      ? embedLine(
          profile.discord
            ? `${getOsuEmoteTemp('discord')?.emote} **${profile.discord}**`
            : null,
          profile.twitter
            ? `${getOsuEmoteTemp('twitter')?.emote} **[@${profile.twitter}](https://twitter.com/${profile.twitter})**`
            : null,
        )
      : null,
  ].filter((value): value is string => Boolean(value));

  return {
    color: profile.profile_colour
      ? parseInt(profile.profile_colour.slice(1), 16)
      : undefined,
    author: {
      name: `${displayMode} profile for ${profile.username}`,
      icon_url: getFlag(profile.country_code),
      url: formatProfileUrl(profile, mode),
    },
    description: description.join('\n'),
    thumbnail: {
      url: profile.avatar_url,
    },
  };
};

export default {
  name: 'profile',
  group: 'osu!',
  prefixable: true,
  description: 'Show an osu! profile',
  execute: async (
    _client: Client,
    { message, args, prefix, invoked }: CommandContext,
  ) => {
    if (!message) return;

    const { positional, options } = parseArgs(args ?? [], {
      options: ['mode', 'm'],
    });

    const username = positional.join(' ').trim();
    const lookup =
      username || (await getLinkedProfileLookup(message.author.id));

    if (!lookup) {
      return message.reply(
        `Usage: \`${prefix}profile <username>\`, or link an account with \`${prefix}setosu <username|id>\` first.`,
      );
    }

    const mode = getMode(options, invoked ?? '');
    const explicitMode =
      options.has('mode') || options.has('m') || invoked !== 'profile';
    const profile = await getProfile(lookup, explicitMode ? mode : undefined);

    return message.reply({
      embeds: [buildProfileEmbed(profile, explicitMode ? mode : undefined)],
    });
  },
} satisfies Command;
