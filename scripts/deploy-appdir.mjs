#!/usr/bin/env node
// Deploy the built AppImage's app.asar into the live AppDir.
//
// Why not `asar pack out resources/app.asar`: electron-builder packages
// out/ PLUS the production node_modules (vue) into the AppImage. Packing out/
// alone produces an asar with no vue, so the app window is blank. Always take
// the asar back out of the built image instead.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const appdir = process.env.USGUI_APPDIR || '/home/Ryuu/Applications/Ultimate-Scrcpy';
const dist = path.join(root, 'dist');

const images = fs.readdirSync(dist).filter(f => f.endsWith('.AppImage')).sort();
if (!images.length) throw new Error('No AppImage in dist/ — run `npm run build:linux` first.');
const image = path.join(dist, images.at(-1));

const dest = path.join(appdir, 'resources', 'app.asar');
if (!fs.existsSync(dest)) throw new Error(`Not an AppDir (no ${dest}). Set USGUI_APPDIR.`);

// Keep one rollback copy beside the live asar.
const backup = `${dest}.pre-deploy`;
fs.copyFileSync(dest, backup);

const tmp = fs.mkdtempSync(path.join(dist, 'extract-'));
try {
  execFileSync(image, ['--appimage-extract'], { cwd: tmp, stdio: 'ignore' });
  const asar = path.join(tmp, 'squashfs-root', 'resources', 'app.asar');
  if (!fs.existsSync(asar)) throw new Error('resources/app.asar not found in the extracted AppImage.');
  fs.copyFileSync(asar, dest);
  console.log(`deployed ${path.basename(image)} -> ${dest}`);
  console.log(`rollback copy: ${backup}`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
