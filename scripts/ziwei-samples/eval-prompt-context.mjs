#!/usr/bin/env node
/** 兼容入口：转调 ziwei npm run eval:prompt */
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ziweiDir = join(dirname(fileURLToPath(import.meta.url)), '../../ziwei');
const r = spawnSync('npm', ['run', 'eval:prompt'], {
  cwd: ziweiDir,
  stdio: 'inherit',
  env: process.env,
});
process.exit(r.status ?? 1);
