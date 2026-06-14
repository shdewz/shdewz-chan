export interface ArgSchema {
  flags?: string[];
  options?: string[];
}

export interface ParsedArgs {
  positional: string[];
  flags: Set<string>;
  options: Map<string, string>;
}

export const parseArgs = (
  args: string[],
  schema: ArgSchema = {},
): ParsedArgs => {
  const knownFlags = new Set(schema.flags ?? []);
  const knownOptions = new Set(schema.options ?? []);

  const positional: string[] = [];
  const flags = new Set<string>();
  const options = new Map<string, string>();

  for (let i = 0; i < args.length; i++) {
    const arg = args[i] ?? '';

    let key: string | null = null;
    if (arg.startsWith('--') && arg.length > 2) {
      key = arg.slice(2);
    } else if (arg.startsWith('-') && arg.length === 2) {
      key = arg.slice(1);
    }

    if (key !== null) {
      if (knownOptions.has(key)) {
        const next = args[i + 1];
        options.set(key, next ?? '');
        if (next) i++;
      } else if (knownFlags.has(key)) {
        flags.add(key);
      } else {
        positional.push(arg);
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags, options };
};
