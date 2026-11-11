#!/usr/bin/env node
// Build the out/ directory that electron-builder packages.
// The upstream scrcpy-gui used electron-vite to produce out/; this fork patches
// the built files directly, so we mirror main/, preload/ and renderer/ into out/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'out');

fs.rmSync(out, { recursive: true, force: true });
for (const dir of ['main', 'preload', 'renderer']) {
  fs.cpSync(path.join(root, dir), path.join(out, dir), { recursive: true });
}

// Never ship stale build artefacts (a leftover .broken bundle once slipped in).
const assets = path.join(out, 'renderer', 'assets');
let removed = 0;
for (const entry of fs.readdirSync(assets)) {
  if (entry.endsWith('.broken')) {
    fs.rmSync(path.join(assets, entry));
    removed += 1;
  }
}

console.log(`out/ ready: ${fs.readdirSync(out).sort().join(', ')}${removed ? ` (dropped ${removed} stale file(s))` : ''}`);
