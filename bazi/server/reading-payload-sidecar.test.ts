/**
 * 旁路 payload：auth upsert 失败时仍能生成 paid。
 */
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  resolveReadingReportPaths,
  writeReadingPayloadSidecar,
  readReadingPayloadSidecar,
} from "./readingReport.ts";

const prevReportsDir = process.env.REPORTS_DIR;

describe("reading payload sidecar", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "bazi-payload-"));
    process.env.REPORTS_DIR = dir;
  });

  afterEach(() => {
    if (prevReportsDir === undefined) delete process.env.REPORTS_DIR;
    else process.env.REPORTS_DIR = prevReportsDir;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("writes and reads sidecar next to the report html path", () => {
    const readingId = "bazi_sidecar_test_1";
    const payload = {
      type: "single" as const,
      lang: "zh-CN",
      resultData: {
        name: "美美",
        riZhu: "戊",
        year: { gan: "丙", zhi: "辰" },
        month: { gan: "丙", zhi: "申" },
        day: { gan: "戊", zhi: "戌" },
        hour: { gan: "庚", zhi: "申" },
      },
    };
    const written = writeReadingPayloadSidecar(readingId, payload);
    const paths = resolveReadingReportPaths(readingId);
    expect(written).toBe(paths.payloadPath);
    expect(fs.existsSync(paths.payloadPath)).toBe(true);
    const read = readReadingPayloadSidecar(readingId);
    expect(read?.type).toBe("single");
    expect(read?.resultData.name).toBe("美美");
    expect((read?.resultData.day as { gan: string }).gan).toBe("戊");
  });

  it("returns null for missing or corrupt sidecar", () => {
    expect(readReadingPayloadSidecar("missing")).toBeNull();
    const readingId = "bazi_sidecar_bad";
    const paths = resolveReadingReportPaths(readingId);
    fs.mkdirSync(paths.reportsDir, { recursive: true });
    fs.writeFileSync(paths.payloadPath, "{not-json", "utf8");
    expect(readReadingPayloadSidecar(readingId)).toBeNull();
  });
});
