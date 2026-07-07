/**
 * 紫微 AI 提示上下文评估 — 固定命例快照，用于回归对比。
 *
 * 用法：cd ziwei && npm run eval:prompt
 * 或：EVAL_WRITE=1 npm run eval:prompt
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateChart } from '@/lib/ziwei/algorithm';
import { EVAL_FIXTURES } from '@/lib/samples/eval-fixtures';
import {
  buildSampleContextForChart,
  buildSampleContextForInterpret,
  pickTopicsForChat,
} from '@/lib/samples/prompt';
import { lookupSampleTopics, isSampleLibraryAvailable } from '@/lib/samples/lookup';
import { normalizeSampleYear } from '@/lib/samples/keys';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const available = await isSampleLibraryAvailable();
  const results = {
    generatedAt: new Date().toISOString(),
    samplesAvailable: available,
    fixtures: [] as Array<Record<string, unknown>>,
  };

  for (const fx of EVAL_FIXTURES) {
    const chart = generateChart(fx.birthInfo);
    const canonicalYear = normalizeSampleYear(fx.birthInfo.year);
    const topics = await lookupSampleTopics(fx.birthInfo);
    const topicKeysByHint = fx.chatHints.map((hint) => ({
      hint,
      keys: pickTopicsForChat(hint, Boolean(fx.minorMode), chart),
    }));

    const contextReport = await buildSampleContextForChart(chart, {
      minorMode: Boolean(fx.minorMode),
      includeClassics: true,
    });

    const contextChat = await buildSampleContextForInterpret(chart, {
      minorMode: Boolean(fx.minorMode),
      messages: [{ role: 'user', content: fx.chatHints[0] ?? '' }],
      includeClassics: true,
    });

    results.fixtures.push({
      id: fx.id,
      canonicalYear,
      hasTopics: Boolean(topics),
      topicOverviewLen: topics?.overview?.length ?? 0,
      topicKeysByHint,
      contextReportLen: contextReport.length,
      contextChatLen: contextChat.length,
      contextReportPreview: contextReport.slice(0, 400),
      contextChatPreview: contextChat.slice(0, 400),
    });
  }

  const json = JSON.stringify(results, null, 2);
  console.log(json);

  if (process.env.EVAL_WRITE === '1') {
    const outDir = join(__dirname, '../lib/samples/eval-snapshots');
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, 'latest.json');
    writeFileSync(outPath, json);
    console.error(`[eval] wrote ${outPath}`);
  }

  const failed = results.fixtures.filter((f) => available && !f.hasTopics);
  process.exit(failed.length > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('[eval] failed:', err);
  process.exit(1);
});
