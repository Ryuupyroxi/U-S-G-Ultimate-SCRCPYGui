#!/usr/bin/env node
// Populate resources/ with the scrcpy/adb/tools bundle that the AppImage ships.
// These are ~46 MB and are not kept in git; copy them from an extracted AppImage
// on this machine. Override the source with USGUI_RESOURCE_SOURCE.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dest = path.join(root, 'resources');
const source = process.env.USGUI_RESOURCE_SOURCE || '/home/Ryuu/Applications/Ultimate-Scrcpy/resources';
const items = ['scrcpy', 'icons', 'tools'];

fs.mkdirSync(dest, { recursive: true });
const missing = [];
for (const item of items) {
  const from = path.join(source, item);
  const to = path.join(dest, item);
  if (!fs.existsSync(from)) { missing.push(from); continue; }
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
  console.log(`resources/${item} <- ${from}`);
}

if (missing.length) {
  console.error('Missing resource sources:\n  ' + missing.join('\n  '));
  console.error('Point USGUI_RESOURCE_SOURCE at an extracted AppImage resources/ directory.');
  process.exit(1);
}
