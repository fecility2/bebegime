import { cp, mkdir, rm, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'www');

const excluded = new Set([
  '.git',
  '.gitignore',
  'node_modules',
  'www',
  'android',
  'ios',
  'native-widget-templates',
  'scripts',
  'package.json',
  'package-lock.json',
  'capacitor.config.json',
  'NATIVE_WIDGETS.md'
]);

const includedExtensions = new Set([
  '.html',
  '.css',
  '.js',
  '.json',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.mp3',
  '.mp4',
  '.wav',
  '.m4a',
  '.ico'
]);

async function copyEntry(source, target) {
  const info = await stat(source);
  if (info.isDirectory()) {
    await mkdir(target, { recursive: true });
    for (const child of await readdir(source)) {
      await copyEntry(path.join(source, child), path.join(target, child));
    }
    return;
  }

  if (!includedExtensions.has(path.extname(source).toLowerCase())) return;
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of await readdir(root)) {
  if (excluded.has(entry)) continue;
  await copyEntry(path.join(root, entry), path.join(outDir, entry));
}

await writeFile(
  path.join(outDir, 'capacitor-ready.txt'),
  `Prepared for Capacitor at ${new Date().toISOString()}\n`,
  'utf8'
);

console.log(`Prepared Capacitor web assets in ${outDir}`);
