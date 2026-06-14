import fs from 'fs';
import path from 'path';

export const walkDir = (dir: string, files: string[] = []): string[] => {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, files);
    } else if (entry.isFile() && /\.(js|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
};
