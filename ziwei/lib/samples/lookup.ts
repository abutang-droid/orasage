import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { createGunzip } from 'node:zlib';
import { DatabaseSync } from 'node:sqlite';
import type { BirthInfo } from '@/lib/ziwei/types';
import {
  lookupKeyString,
  normalizeLookupKey,
  sampleArchivePath,
  sampleLineIndex,
} from './keys';
import type { SampleLookupKey, SampleRecord, SampleTopics } from './types';
import { birthInfoToLookupKey } from './types';

const DEFAULT_SAMPLES_ROOT =
  process.env.ZIWEI_SAMPLES_DIR ||
  '/opt/orasage/data/ziwei-samples/ziwei-samples-toolkit';

/** 按月缓存已解析的 topics（最多保留 8 个月份，约数十 MB） */
const monthCache = new Map<string, Map<string, SampleTopics>>();
const MONTH_CACHE_MAX = 8;

let sqliteDb: DatabaseSync | null = null;
let sqliteChecked = false;

function samplesEnabled(): boolean {
  if (process.env.ZIWEI_SAMPLES_ENABLED === 'false') return false;
  return true;
}

function getSamplesRoot(): string {
  return process.env.ZIWEI_SAMPLES_DIR || DEFAULT_SAMPLES_ROOT;
}

function getSqliteIndexPath(): string | null {
  const explicit = process.env.ZIWEI_SAMPLES_INDEX?.trim();
  if (explicit) return explicit;
  const root = getSamplesRoot();
  return `${root}/samples-index.sqlite`;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function getSqliteDb(): DatabaseSync | null {
  if (sqliteChecked) return sqliteDb;
  sqliteChecked = true;

  const path = getSqliteIndexPath();
  if (!path) return null;

  try {
    const db = new DatabaseSync(path, { readOnly: true });
    db.prepare('SELECT 1 FROM samples LIMIT 1').get();
    sqliteDb = db;
  } catch {
    sqliteDb = null;
  }
  return sqliteDb;
}

function lookupFromSqlite(key: SampleLookupKey): SampleTopics | null {
  const db = getSqliteDb();
  if (!db) return null;

  const row = db
    .prepare('SELECT topics_json FROM samples WHERE lookup_key = ?')
    .get(lookupKeyString(key)) as { topics_json?: string } | undefined;

  if (!row?.topics_json) return null;
  try {
    return JSON.parse(row.topics_json) as SampleTopics;
  } catch {
    return null;
  }
}

async function loadMonthCache(archivePath: string): Promise<Map<string, SampleTopics> | null> {
  const cached = monthCache.get(archivePath);
  if (cached) return cached;

  if (!(await fileExists(archivePath))) return null;

  const topicsByKey = new Map<string, SampleTopics>();

  await new Promise<void>((resolve, reject) => {
    const input = createReadStream(archivePath);
    const gunzip = createGunzip();
    const rl = createInterface({ input: gunzip, crlfDelay: Infinity });

    input.on('error', reject);
    gunzip.on('error', reject);

    rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        const row = JSON.parse(line) as {
          birthInfo: SampleLookupKey;
          topics: SampleTopics;
        };
        const norm = normalizeLookupKey(row.birthInfo);
        topicsByKey.set(lookupKeyString(norm), row.topics);
      } catch {
        // skip malformed line
      }
    });

    rl.on('close', () => resolve());
    rl.on('error', reject);
    input.pipe(gunzip);
  });

  if (monthCache.size >= MONTH_CACHE_MAX) {
    const first = monthCache.keys().next().value;
    if (first) monthCache.delete(first);
  }
  monthCache.set(archivePath, topicsByKey);
  return topicsByKey;
}

async function lookupFromGzip(key: SampleLookupKey): Promise<SampleTopics | null> {
  const root = getSamplesRoot();
  const archivePath = sampleArchivePath(root, key);

  const month = await loadMonthCache(archivePath);
  if (!month) return null;

  return month.get(lookupKeyString(key)) ?? null;
}

/** 按 birthInfo 查询样本库 topics；未命中返回 null */
export async function lookupSampleTopics(
  birthInfo: BirthInfo,
): Promise<SampleTopics | null> {
  if (!samplesEnabled()) return null;

  const key = normalizeLookupKey(birthInfoToLookupKey(birthInfo));

  const fromSqlite = lookupFromSqlite(key);
  if (fromSqlite) return fromSqlite;

  return lookupFromGzip(key);
}

/** 完整样本记录（含 birthInfo 校验） */
export async function lookupSample(birthInfo: BirthInfo): Promise<SampleRecord | null> {
  const topics = await lookupSampleTopics(birthInfo);
  if (!topics) return null;
  const key = normalizeLookupKey(birthInfoToLookupKey(birthInfo));
  return {
    birthInfo: key,
    topics,
    system: '倪海厦紫微斗数',
  };
}

/** 预检：样本目录是否可用 */
export async function isSampleLibraryAvailable(): Promise<boolean> {
  if (!samplesEnabled()) return false;

  const indexPath = getSqliteIndexPath();
  if (indexPath && (await fileExists(indexPath))) return true;

  const root = getSamplesRoot();
  const probe = sampleArchivePath(
    root,
    normalizeLookupKey({ year: 1955, month: 3, day: 1, hour: 0, gender: 'male' }),
  );
  return fileExists(probe);
}

export { sampleLineIndex, normalizeLookupKey, getSamplesRoot };
