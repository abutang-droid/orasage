#!/usr/bin/env node
/**
 * Append an entry to shared/admin-backend/changelog.json (newest first).
 *
 * Usage:
 *   node scripts/admin-changelog-append.mjs \
 *     --title "短标题" \
 *     --summary "摘要" \
 *     --modules shop,platform \
 *     --phase A.2 \
 *     --rules-added "说明1" \
 *     --rules-changed "说明2" \
 *     --rules-removed "说明3" \
 *     --link docs/products/admin-config-pack.md
 *
 * Options:
 *   --dry-run     Print entry JSON, do not write
 *   --date YYYY-MM-DD   Default: today UTC
 *   --id slug     Default: derived from date + title
 *   --no-rules-ok Allow empty rulesImpact without note (discouraged)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'shared/admin-backend/changelog.json');

function usage(code = 0) {
  const text = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const block = text.match(/Usage:[\s\S]*?--no-rules-ok[^\n]*/);
  console.log(block ? block[0] : 'See script header for usage.');
  process.exit(code);
}

function parseArgs(argv) {
  const out = {
    title: '',
    summary: '',
    modules: [],
    phase: '',
    links: [],
    rulesAdded: [],
    rulesChanged: [],
    rulesRemoved: [],
    date: '',
    id: '',
    dryRun: false,
    noRulesOk: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v == null) throw new Error(`Missing value after ${a}`);
      return v;
    };
    if (a === '--help' || a === '-h') usage(0);
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--no-rules-ok') out.noRulesOk = true;
    else if (a === '--title') out.title = next();
    else if (a === '--summary') out.summary = next();
    else if (a === '--phase') out.phase = next();
    else if (a === '--date') out.date = next();
    else if (a === '--id') out.id = next();
    else if (a === '--modules') {
      out.modules = next()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a === '--link') out.links.push(next());
    else if (a === '--rules-added') out.rulesAdded.push(next());
    else if (a === '--rules-changed') out.rulesChanged.push(next());
    else if (a === '--rules-removed') out.rulesRemoved.push(next());
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.title || !args.summary) {
    console.error('Error: --title and --summary are required.');
    usage(1);
  }

  const date = args.date || new Date().toISOString().slice(0, 10);
  const id = args.id || `${date}-${slugify(args.title) || 'update'}`;

  const rulesImpact = {
    added: args.rulesAdded,
    changed: args.rulesChanged,
    removed: args.rulesRemoved,
  };
  const noRules =
    rulesImpact.added.length + rulesImpact.changed.length + rulesImpact.removed.length === 0;
  if (noRules && !args.noRulesOk && !/无全局规则变更|无规则变更/.test(args.summary)) {
    console.error(
      'Error: rulesImpact is empty. Pass --rules-added/changed/removed, or mention「无全局规则变更」in --summary, or use --no-rules-ok.',
    );
    process.exit(1);
  }

  const entry = {
    id,
    date,
    title: args.title,
    summary: args.summary,
    modules: args.modules,
    phase: args.phase || undefined,
    rulesImpact,
    links: args.links,
  };
  if (!entry.phase) delete entry.phase;

  if (args.dryRun) {
    console.log(JSON.stringify(entry, null, 2));
    return;
  }

  const raw = fs.readFileSync(FILE, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.entries)) data.entries = [];
  if (data.entries.some((e) => e.id === id)) {
    console.error(`Error: entry id already exists: ${id}`);
    process.exit(1);
  }
  data.entries.unshift(entry);
  data.version = data.version ?? 1;
  fs.writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Appended changelog entry: ${id}`);
  console.log(`File: ${FILE}`);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
