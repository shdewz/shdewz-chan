import {
  EMOTES,
  MODES,
  MODE_PREFIX_ALIASES,
  MODE_SUFFIX_ALIASES,
  MODS_ENUM,
  type ModKey,
  type OsuMode,
} from '@/lib/osu/constants.js';

const PREFIX_RE = new RegExp(`^(${MODE_PREFIX_ALIASES.join('|')})`, 'i');
const SUFFIX_RE = new RegExp(`(${MODE_SUFFIX_ALIASES.join('|')})$`, 'i');

export const getEmote = (name: string) => EMOTES.find((e) => e.name === name);

export const getMode = (
  options: Map<string, string>,
  command: string = '',
): OsuMode => {
  const modeArg = options.get('mode') ?? options.get('m');
  if (modeArg) return parseMode(modeArg);

  const match = PREFIX_RE.exec(command)?.[1] ?? SUFFIX_RE.exec(command)?.[1];
  return parseMode(match ?? '');
};

const parseMode = (input: string): OsuMode =>
  MODES.find((m) => m.aliases.includes(input.toLowerCase()))?.mode ?? 'osu';

export const getDisplayMode = (mode: string): string =>
  MODES.find((m) => m.mode === mode || m.aliases.includes(mode))?.display ??
  'osu!';

export const modsFromBitmask = (bitmask: number): ModKey[] =>
  (Object.entries(MODS_ENUM) as [ModKey, number][])
    .filter(([, val]) => val !== 0 && (bitmask & val) === val)
    .map(([key]) => key);

export const modsFromString = (mods: string): number => {
  if (!mods) return 0;
  return (mods.replace(/[^a-zA-Z]/g, '').match(/.{2}/g) ?? []).reduce(
    (acc, mod) => acc + (MODS_ENUM[mod as ModKey] ?? 0),
    0,
  );
};

export const isFC = (scoreMaxCombo: number, mapMaxCombo: number): boolean =>
  scoreMaxCombo >= mapMaxCombo * 0.998;

export const scoreCompletion = (
  hits: HitCounts,
  beatmap: BeatmapCounts,
): number => {
  const userHits =
    hits.count_300 + hits.count_100 + hits.count_50 + hits.count_miss;
  const maxHits =
    beatmap.count_circles + beatmap.count_sliders + beatmap.count_spinners;
  return userHits / maxHits;
};

export const mapYear = (beatmap: {
  beatmapset: { ranked_date?: string; submitted_date: string };
}): number =>
  new Date(
    beatmap.beatmapset.ranked_date ?? beatmap.beatmapset.submitted_date,
  ).getFullYear();

type HitCounts = {
  count_300: number;
  count_100: number;
  count_50: number;
  count_miss: number;
};
type BeatmapCounts = {
  count_circles: number;
  count_sliders: number;
  count_spinners: number;
};
