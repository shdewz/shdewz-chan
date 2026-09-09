export type OsuMode = 'osu' | 'taiko' | 'fruits' | 'mania';
export type Grade = 'SSH' | 'SS' | 'SH' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export type ModeConfig = {
  mode: OsuMode;
  display: string;
  aliases: string[];
};

export type EmoteConfig = {
  name: string;
  color: number;
  emoji: string;
};
