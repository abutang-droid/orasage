import { describe, expect, it } from "vitest";
import { getSeedCities } from "@orasage/city";
import { pickCityFromSpeech } from "../client/src/pages/luopan/speechPlace";

describe("pickCityFromSpeech", () => {
  const catalog = getSeedCities();

  it("picks 北京 from a full birth sentence", () => {
    const hit = pickCityFromSpeech("一九六二年八月十四下午三点二十分北京", catalog);
    expect(hit?.city).toBe("北京");
  });

  it("picks 上海 after 出生在", () => {
    const hit = pickCityFromSpeech("公历一九九零年一月一日早上八点出生在上海", catalog);
    expect(hit?.city).toBe("上海");
  });

  it("returns null when no city is spoken", () => {
    expect(pickCityFromSpeech("一九六二年八月十四下午三点二十分", catalog)).toBeNull();
  });
});
