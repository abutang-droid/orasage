import { describe, it, expect } from "vitest";
import { sanitizeReportBrandText } from "../shared/report-brand.ts";

describe("sanitizeReportBrandText", () => {
  it("replaces 算法依据 with Orasage", () => {
    expect(sanitizeReportBrandText("算法依据：日主乙木身强。")).toBe("Orasage：日主乙木身强。");
  });

  it("replaces bracketed 依据 labels", () => {
    expect(sanitizeReportBrandText("性格[依据：正印格]。")).toBe("性格[Orasage：正印格]。");
  });
});
