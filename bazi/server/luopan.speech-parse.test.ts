import { describe, expect, it } from "vitest";
import { getSeedCities } from "@orasage/city";
import {
  mergeLuopanSpeechFields,
  parseLlmSpeechJson,
  parseLuopanSpeech,
} from "../client/src/pages/luopan/speechParse";
import { extractLuopanBirth, luopanVoiceCapabilities } from "./luopanSpeech";
import { appRouter } from "./routers";
import { pickCityFromSpeech } from "../client/src/pages/luopan/speechPlace";

describe("parseLuopanSpeech", () => {
  it("parses a full spoken solar birth with name, city markers, and clock", () => {
    const o = parseLuopanSpeech(
      "我叫张三公历一九九零年八月十五日下午三点二十分北京女",
    );
    expect(o.name).toBe("张三");
    expect(o.y).toBe(1990);
    expect(o.m).toBe(8);
    expect(o.d).toBe(15);
    expect(o.hh).toBe(15);
    expect(o.mi).toBe(20);
    expect(o.sex).toBe("女");
    expect(o.lunar).toBe(false);
  });

  it("does not treat 八月十五 as lunar", () => {
    const o = parseLuopanSpeech("一九九零年八月十五下午三点");
    expect(o.lunar).toBe(false);
    expect(o.m).toBe(8);
    expect(o.d).toBe(15);
    expect(o.hh).toBe(15);
  });

  it("marks 农历正月初一 as lunar", () => {
    const o = parseLuopanSpeech("农历一九六二年正月初一下午申时");
    expect(o.lunar).toBe(true);
    expect(o.y).toBe(1962);
    expect(o.m).toBe(1);
    expect(o.d).toBe(1);
    expect(o.hh).toBe(15);
  });

  it("maps 子时 to 23:00", () => {
    const o = parseLuopanSpeech("一九九一年三月十四日子时");
    expect(o.hh).toBe(23);
    expect(o.mi).toBe(0);
  });

  it("keeps 晚上两点 as 2, not 14", () => {
    const o = parseLuopanSpeech("一九九零年一月一日晚上两点");
    expect(o.hh).toBe(2);
  });

  it("reads trailing 男", () => {
    expect(parseLuopanSpeech("一九六二年八月十四下午三点北京男").sex).toBe("男");
  });
});

describe("parseLlmSpeechJson + merge", () => {
  it("fills name and city from model JSON and keeps regex clock", () => {
    const fallback = parseLuopanSpeech("一九九零年八月十五日下午三点二十分");
    const llm = parseLlmSpeechJson(
      '好的 {"name":"李明","gender":"男","calendar":"solar","year":1990,"month":8,"day":15,"hour":null,"minute":null,"city":"上海市","leap":false}',
    );
    expect(llm?.name).toBe("李明");
    expect(llm?.city).toBe("上海");
    expect(llm?.sex).toBe("男");
    const merged = mergeLuopanSpeechFields(llm, fallback);
    expect(merged.name).toBe("李明");
    expect(merged.city).toBe("上海");
    expect(merged.hh).toBe(15);
    expect(merged.mi).toBe(20);
    expect(merged.y).toBe(1990);
  });

  it("returns null on non-json", () => {
    expect(parseLlmSpeechJson("听不清")).toBeNull();
  });
});

describe("pickCityFromSpeech with extracted city", () => {
  const catalog = getSeedCities();

  it("still picks 北京 from a full sentence", () => {
    expect(pickCityFromSpeech("我叫张三公历一九九零年八月十五日下午三点二十分北京女", catalog)?.city).toBe("北京");
  });

  it("matches LLM city 上海 against the catalog", () => {
    const llm = parseLlmSpeechJson('{"city":"上海"}');
    expect(llm?.city).toBe("上海");
    expect(pickCityFromSpeech(llm!.city!, catalog)?.city).toBe("上海");
  });
});

describe("extractLuopanBirth without LLM keys", () => {
  it("returns regex fields so the API still works", async () => {
    const { fields, parse } = await extractLuopanBirth(
      "我叫张三公历一九九零年八月十五日下午三点二十分北京女",
    );
    if (luopanVoiceCapabilities().nlu) {
      expect(fields.y).toBe(1990);
      expect(fields.name === "张三" || fields.name == null).toBe(true);
      return;
    }
    expect(parse).toBe("regex");
    expect(fields.name).toBe("张三");
    expect(fields.y).toBe(1990);
    expect(fields.hh).toBe(15);
    expect(fields.mi).toBe(20);
    expect(fields.sex).toBe("女");
  });
});

describe("bazi.luopanVoice caller", () => {
  function ctx() {
    return {
      user: null,
      req: {
        protocol: "http",
        headers: {},
        socket: { remoteAddress: "127.0.0.1" },
        ip: "127.0.0.1",
      },
      res: {},
    } as any;
  }

  it("exposes capabilities without requiring AI keys", async () => {
    const caps = await appRouter.createCaller(ctx()).bazi.voiceCapabilities();
    expect(caps).toEqual({
      stt: Boolean(caps.stt),
      nlu: Boolean(caps.nlu),
    });
    expect(typeof caps.stt).toBe("boolean");
    expect(typeof caps.nlu).toBe("boolean");
  });

  it("fills birth fields from a transcript", async () => {
    const res = await appRouter.createCaller(ctx()).bazi.luopanVoice({
      transcript: "我叫张三公历一九九零年八月十五日下午三点二十分北京女",
    });
    expect(res.transcript).toContain("张三");
    expect(res.fields.y).toBe(1990);
    expect(res.fields.m).toBe(8);
    expect(res.fields.d).toBe(15);
    expect(res.fields.hh).toBe(15);
    expect(res.fields.mi).toBe(20);
    expect(res.fields.sex).toBe("女");
    expect(res.fields.name).toBe("张三");
    expect(res.stt).toBe("client");
  });
});
