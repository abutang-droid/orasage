import { describe, it, expect } from "vitest";
import { readingReportFileId, resolveReadingReportPaths } from "./readingReport.ts";

describe("readingReport", () => {
  it("sanitizes readingId into stable file id", () => {
    expect(readingReportFileId("bazi:abc/../x")).toBe("reading_bazi_abc_.._x");
  });

  it("resolveReadingReportPaths uses /reports/reading_*.html", () => {
    const p = resolveReadingReportPaths("session-1");
    expect(p.fileName).toBe("reading_session-1.html");
    expect(p.reportPath).toBe("/reports/reading_session-1.html");
    expect(p.reportUrl).toContain("/reports/reading_session-1.html");
  });
});
