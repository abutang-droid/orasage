import { describe, it, expect } from "vitest";
import { detectLocale, localeFromReferrerUrl } from "../../packages/i18n/src/detect.ts";

describe("detectLocale", () => {
  it("defaults to zh-CN without query, cookie, or accept-language", () => {
    expect(detectLocale()).toBe("zh-CN");
    expect(detectLocale({})).toBe("zh-CN");
  });

  it("prefers query over referrer, cookie, and accept-language", () => {
    expect(
      detectLocale({
        queryLocale: "zh-CN",
        referrerLocale: "en",
        cookieLocale: "en",
        acceptLanguage: "en-US",
      }),
    ).toBe("zh-CN");
  });

  it("uses portal referrer before cookie so Chinese menu entry stays Chinese", () => {
    expect(
      detectLocale({
        referrerLocale: "zh-CN",
        cookieLocale: "en",
        acceptLanguage: "en-US",
      }),
    ).toBe("zh-CN");
  });

  it("fortune-app browser detection stays zh-CN without ?lang=", () => {
    expect(detectLocale({ queryLocale: null, referrerLocale: null })).toBe("zh-CN");
  });
});

describe("localeFromReferrerUrl", () => {
  it("reads /zh-CN from the portal", () => {
    expect(localeFromReferrerUrl("https://orasage.com/zh-CN")).toBe("zh-CN");
    expect(localeFromReferrerUrl("https://orasage.com/zh-CN/readings")).toBe("zh-CN");
  });

  it("ignores non-orasage referrers", () => {
    expect(localeFromReferrerUrl("https://google.com/zh-CN")).toBeNull();
  });
});
