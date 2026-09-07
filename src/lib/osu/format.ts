export const sep = ' **•** ';

export const line = (...parts: (string | null | undefined)[]): string =>
  '> ' + parts.filter(Boolean).join(sep);

export const timestamp = (
  date: string | Date,
  format: 'R' | 'D' = 'R',
): string => `<t:${Math.round(new Date(date).valueOf() / 1000)}:${format}>`;

export const blank = '\u200b';

export const formatMode = (mode: string) => {
  return mode;
};
