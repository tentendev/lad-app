import { copyFile, mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Explicit allowlist: never stage the repository, environment files or receipts.
const artifactDirectory = path.dirname(fileURLToPath(import.meta.url));
const galleryDirectory = path.resolve(artifactDirectory, '../../assets/generated/app-store-concepts-2026-10-08');
const files = [
  'index.html',
  '01-lavender-editorial.png',
  '02-midnight-orbit.png',
  '03-soft-pocket.png',
  '04-bold-violet.png',
  '05-diary-collage.png',
];
const directory = await mkdtemp(path.join(tmpdir(), 'lad-store-review-'));
for (const name of files) {
  await copyFile(path.join(galleryDirectory, name), path.join(directory, name));
}
await copyFile(path.join(artifactDirectory, 'public-review-vercel.json'), path.join(directory, 'vercel.json'));
await writeFile(path.join(directory, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(JSON.stringify({ directory, files: (await readdir(directory)).sort() }));
