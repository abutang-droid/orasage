import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { createGunzip } from 'node:zlib';
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

function samplesEnabled(): boolean {
  if (process.env.ZIWEI_SAMPLES_ENABLED === 'false') return false;
  return true;
}

function getSamplesRoot(): string {
  return process.env.ZIWEI_SAMPLES_DIR || DEFAULT_SAMPLES_ROOT;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
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

/** 按 birthInfo 查询样本库 topics；未命中返回 null */
export async function lookupSampleTopics(
  birthInfo: BirthInfo,
): Promise<SampleTopics | null> {
  if (!samplesEnabled()) return null;

  const key = normalizeLookupKey(birthInfoToLookupKey(birthInfo));
  const root = getSamplesRoot();
  const archivePath = sampleArchivePath(root, key);

  const month = await loadMonthCache(archivePath);
  if (!month) return null;

  return month.get(lookupKeyString(key)) ?? null;
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
  const root = getSamplesRoot();
  const probe = sampleArchivePath(
    root,
    normalizeLookupKey({ year: 1955, month: 3, day: 1, hour: 0, gender: 'male' }),
  );
  return fileExists(probe);
}

export { sampleLineIndex, normalizeLookupKey, getSamplesRoot };
