import { describe, it, expect } from "vitest";
import { sanitizeReportBrandText } from "../shared/report-brand.ts";

describe("sanitizeReportBrandText", () => {
  it("replaces 算法依据 with 海棠未眠", () => {
    expect(sanitizeReportBrandText("算法依据：日主乙木身强。")).toBe("海棠未眠：日主乙木身强。");
  });

  it("replaces bracketed 依据 labels", () => {
    expect(sanitizeReportBrandText("性格[依据：正印格]。")).toBe("性格[海棠未眠：正印格]。");
  });
});
