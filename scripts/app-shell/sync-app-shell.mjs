#!/usr/bin/env node
/**
 * Sync shared App Shell into vendored copies across all apps.
 *
 * Authority: shared/app-shell/
 *
 * Usage:
 *   node scripts/app-shell/sync-app-shell.mjs        # write copies
 *   node scripts/app-shell/sync-app-shell.mjs check  # exit 1 if drift
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIR = path.join(ROOT, 'shared/app-shell');

const TS_FILES = [
  'AppShell.tsx',
  'AppBrandMark.tsx',
  'OrasageAuthChip.tsx',
  'SiteTopNav.tsx',
  'LocaleSwitcher.tsx',
  'locale-cookie.ts',
  'BottomNav.tsx',
  'config.ts',
  'labels.ts',
  'index.ts',
];

const TARGETS = [
  { dir: 'main/src/lib/orasage-app-shell', files: TS_FILES },
  { dir: 'shop/src/lib/orasage-app-shell', files: TS_FILES },
  { dir: 'admin/src/lib/orasage-app-shell', files: TS_FILES },
  { dir: 'cms/src/lib/orasage-app-shell', files: TS_FILES },
  { dir: 'bazi/client/src/lib/orasage-app-shell', files: TS_FILES },
  { dir: 'ziwei/lib/orasage-app-shell', files: TS_FILES },
  { dir: 'tarot/src/lib/orasage-app-shell', files: TS_FILES },
  {
    dir: 'auth-service/public/assets',
    files: [],
    cssOnly: 'app-shell.css',
  },
];

function read(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function syncOne(sourceRel, destPath) {
  const sourcePath = path.join(SOURCE_DIR, sourceRel);
  const source = read(sourcePath);
  if (source === null) {
    console.error(`[app-shell] missing source: ${sourceRel}`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, source.endsWith('\n') ? source : `${source}\n`, 'utf8');
}

export function syncAppShell({ quiet = false } = {}) {
  for (const target of TARGETS) {
    if (target.cssOnly) {
      const dest = path.join(ROOT, target.dir, target.cssOnly);
      syncOne('app-shell.css', dest);
      if (!quiet) console.log(`[app-shell] synced app-shell.css → ${path.relative(ROOT, dest)}`);
      continue;
    }
    for (const file of [...target.files, 'app-shell.css']) {
      const dest = path.join(ROOT, target.dir, file);
      syncOne(file, dest);
      if (!quiet) console.log(`[app-shell] synced ${file} → ${path.relative(ROOT, dest)}`);
    }
  }
}

export function checkAppShell() {
  const drift = [];
  for (const target of TARGETS) {
    if (target.cssOnly) {
      const source = read(path.join(SOURCE_DIR, 'app-shell.css'));
      const dest = read(path.join(ROOT, target.dir, target.cssOnly));
      if (source !== dest) drift.push(path.join(target.dir, target.cssOnly));
      continue;
    }
    for (const file of [...target.files, 'app-shell.css']) {
      const source = read(path.join(SOURCE_DIR, file));
      const dest = read(path.join(ROOT, target.dir, file));
      if (source !== dest) drift.push(path.join(target.dir, file));
    }
  }
  if (drift.length === 0) {
    console.log('[app-shell] check ok — all copies match shared/app-shell');
    return;
  }
  console.error('[app-shell] drift detected:');
  for (const file of drift) console.error(`  - ${file}`);
  console.error('[app-shell] run: npm run app-shell:sync');
  process.exit(1);
}

const mode = process.argv[2];
if (mode === 'check') {
  checkAppShell();
} else if (mode === 'sync' || !mode) {
  syncAppShell();
} else {
  console.error(`[app-shell] unknown mode: ${mode} (use sync | check)`);
  process.exit(1);
}
