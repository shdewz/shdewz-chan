import type { OsuMode } from '@/lib/osu/types/common';

export type OsuProfileStatistics = {
  level: {
    current: number;
    progress: number;
  };
  global_rank: number | null;
  country_rank: number | null;
  pp: number;
  hit_accuracy: number;
  play_count: number;
  play_time: number;
  count_300: number;
  count_100: number;
  count_50: number;
  count_miss: number;
  ranked_score: number;
  total_score: number;
  grade_counts: {
    ssh: number;
    ss: number;
    sh: number;
    s: number;
    a: number;
  };
};

export type OsuProfile = {
  id: number;
  username: string;
  avatar_url: string;
  country_code: string;
  title: string | null;
  profile_colour: string | null;
  playmode?: OsuMode;
  is_online?: boolean;
  join_date: string;
  last_visit: string | null;
  twitter: string | null;
  discord: string | null;
  badges: unknown[];
  user_achievements: unknown[];
  scores_first_count: number;
  ranked_beatmapset_count: number;
  loved_beatmapset_count: number;
  guest_beatmapset_count: number;
  rank_highest: { rank: number; updated_at: string } | null;
  statistics: OsuProfileStatistics;
};
