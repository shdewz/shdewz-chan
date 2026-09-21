import * as osu from 'osu-api-v2-js';

export type ModeConfig = {
  mode: keyof typeof osu.Ruleset;
  display: string;
  aliases: string[];
};

export const MODES: ModeConfig[] = [
  { mode: 'osu', display: 'osu!', aliases: ['osu', 'std', 'standard'] },
  { mode: 'taiko', display: 'osu!taiko', aliases: ['taiko', 't'] },
  {
    mode: 'fruits',
    display: 'osu!catch',
    aliases: ['fruits', 'catch', 'ctb', 'c'],
  },
  { mode: 'mania', display: 'osu!mania', aliases: ['mania', 'm'] },
];

export const MODE_RULESET_MAP = {
  osu: osu.Ruleset.osu,
  taiko: osu.Ruleset.taiko,
  fruits: osu.Ruleset.fruits,
  mania: osu.Ruleset.mania,
} as const satisfies Record<keyof typeof osu.Ruleset, osu.Ruleset>;

export const MODE_SUFFIX_ALIASES = MODES.flatMap((m) =>
  m.aliases.filter((a) => a.length > 1),
);
export const MODE_PREFIX_ALIASES = MODES.flatMap((m) => m.aliases);
