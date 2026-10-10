import { describe, expect, it } from "vitest";
import { getSeedCities } from "@orasage/city";
import { parseSpeech } from "../client/src/pages/luopan/speechParse";
import { pickCityFromSpeech } from "../client/src/pages/luopan/speechPlace";

describe("parseSpeech maps spoken birth onto dial fields", () => {
  it("reads the on-page hint sentence (Chinese digits + 下午)", () => {
    const o = parseSpeech("一九六二年八月十四，下午三点二十分，北京");
    expect(o).toMatchObject({ y: 1962, m: 8, d: 14, hh: 15, mi: 20, lunar: false, sex: null });
  });

  it("reads Chrome-style Arabic ASR", () => {
    const o = parseSpeech("1962年8月14日下午3点20分北京女");
    expect(o).toMatchObject({ y: 1962, m: 8, d: 14, hh: 15, mi: 20, sex: "女", lunar: false });
  });

  it("reads hyphen dates and colon time", () => {
    const o = parseSpeech("1962-8-14 15:30 男");
    expect(o).toMatchObject({ y: 1962, m: 8, d: 14, hh: 15, mi: 30, sex: "男" });
  });

  it("treats 农历正月初八 as lunar, not solar August", () => {
    const o = parseSpeech("农历一九九八年正月初八早上六点");
    expect(o).toMatchObject({ y: 1998, m: 1, d: 8, hh: 6, mi: 0, lunar: true, solar: false });
  });

  it("keeps 公历八月十五 as solar (十五 alone is not lunar)", () => {
    const o = parseSpeech("公历一九六二年八月十五下午三点");
    expect(o).toMatchObject({ y: 1962, m: 8, d: 15, hh: 15, lunar: false, solar: true });
  });

  it("marks 闰七月 and 廿三 as lunar leap", () => {
    const o = parseSpeech("农历闰七月廿三申时");
    expect(o).toMatchObject({ m: 7, d: 23, hh: 15, mi: 0, lunar: true, leap: true });
  });

  it("maps 地支时辰 when no clock is spoken", () => {
    expect(parseSpeech("一九六二年八月十四申时").hh).toBe(15);
    expect(parseSpeech("子时").hh).toBe(23);
  });

  it("keeps 晚上两点 as 02:00 and 下午两点 as 14:00", () => {
    expect(parseSpeech("晚上两点").hh).toBe(2);
    expect(parseSpeech("下午两点").hh).toBe(14);
    expect(parseSpeech("晚上十二点").hh).toBe(0);
    expect(parseSpeech("三点半").mi).toBe(30);
    expect(parseSpeech("晚8点").hh).toBe(20);
    expect(parseSpeech("农历1998年正初八晚8点北京女")).toMatchObject({
      y: 1998,
      m: 1,
      d: 8,
      hh: 20,
      sex: "女",
      lunar: true,
    });
  });

  it("fills day from 八月十四 without 日", () => {
    expect(parseSpeech("八月十四")).toMatchObject({ m: 8, d: 14 });
  });

  it("reads 号 as 日 and a two-digit year", () => {
    expect(parseSpeech("九八年8月14号")).toMatchObject({ y: 1998, m: 8, d: 14 });
  });

  it("reads a four-digit Chinese year even without 年", () => {
    expect(parseSpeech("一九六二八月十四")).toMatchObject({ y: 1962, m: 8, d: 14 });
  });

  it("maps 坤造 / 乾造 and trailing 女/男", () => {
    expect(parseSpeech("坤造").sex).toBe("女");
    expect(parseSpeech("乾造").sex).toBe("男");
    expect(parseSpeech("一九六二年八月十四女").sex).toBe("女");
  });
});

describe("pickCityFromSpeech still finds the city in a full utterance", () => {
  const catalog = getSeedCities();

  it("picks 北京 from the hint sentence with commas", () => {
    const hit = pickCityFromSpeech("一九六二年八月十四，下午三点二十分，北京，女", catalog);
    expect(hit?.city).toBe("北京");
  });
});
