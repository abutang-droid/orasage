import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  saveBaziRecord: vi.fn().mockResolvedValue({ insertId: 1 }),
  getUserBaziRecords: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      type: "single",
      name1: "张三",
      name2: null,
      inputData: { year: 1990, month: 1, day: 1 },
      resultSummary: { riZhu: "甲子", strength: "偏弱" },
      createdAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      userId: 1,
      type: "couple",
      name1: "张三",
      name2: "李四",
      inputData: { person1: {}, person2: {} },
      resultSummary: { score: 85, rating: "良缘" },
      createdAt: new Date("2024-01-02"),
    },
  ]),
  deleteBaziRecord: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "测试用户",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("bazi.saveRecord", () => {
  it("saves a single bazi record for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bazi.saveRecord({
      type: "single",
      name1: "张三",
      inputData: { year: 1990, month: 1, day: 1, hour: 8, minute: 0 },
      resultSummary: { riZhu: "甲子", strength: "偏弱" },
    });
    expect(result).toEqual({ success: true });
  });

  it("saves a couple bazi record for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bazi.saveRecord({
      type: "couple",
      name1: "张三",
      name2: "李四",
      inputData: { person1: {}, person2: {} },
      resultSummary: { score: 85, rating: "良缘" },
    });
    expect(result).toEqual({ success: true });
  });

  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bazi.saveRecord({
        type: "single",
        name1: "张三",
        inputData: {},
      })
    ).rejects.toThrow();
  });
});

describe("bazi.getRecords", () => {
  it("returns records for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const records = await caller.bazi.getRecords();
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBe(2);
    expect(records[0].name1).toBe("张三");
    expect(records[1].type).toBe("couple");
  });

  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bazi.getRecords()).rejects.toThrow();
  });
});

describe("bazi.deleteRecord", () => {
  it("deletes a record for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bazi.deleteRecord({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bazi.deleteRecord({ id: 1 })).rejects.toThrow();
  });
});
