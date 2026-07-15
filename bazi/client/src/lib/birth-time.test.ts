import { describe, expect, it } from "vitest";
import {
  birthTimePayload,
  resolveUnknownBirthTime,
  UNKNOWN_BIRTH_HOUR,
  UNKNOWN_BIRTH_MINUTE,
} from "./birth-time";

describe("resolveUnknownBirthTime (T0-01 / T1-01)", () => {
  it("空时辰提交为 08:00", () => {
    expect(resolveUnknownBirthTime("", "")).toEqual({
      hour: UNKNOWN_BIRTH_HOUR,
      minute: UNKNOWN_BIRTH_MINUTE,
    });
    expect(birthTimePayload("", "")).toEqual({ hour: 8, minute: 0 });
  });

  it("仅空小时时补 08，保留已选分钟", () => {
    expect(resolveUnknownBirthTime("", "30")).toEqual({ hour: "08", minute: "30" });
    expect(birthTimePayload("", "30")).toEqual({ hour: 8, minute: 30 });
  });

  it("仅空分钟时补 00，保留已选小时", () => {
    expect(resolveUnknownBirthTime("10", "")).toEqual({ hour: "10", minute: "00" });
    expect(birthTimePayload("10", "")).toEqual({ hour: 10, minute: 0 });
  });

  it("明确选择 10:30 原样提交", () => {
    expect(resolveUnknownBirthTime("10", "30")).toEqual({ hour: "10", minute: "30" });
    expect(birthTimePayload("10", "30")).toEqual({ hour: 10, minute: 30 });
  });

  it("空白字符串视为空", () => {
    expect(birthTimePayload("  ", "  ")).toEqual({ hour: 8, minute: 0 });
  });
});
