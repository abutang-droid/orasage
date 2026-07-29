import type { NextFunction, Request, Response } from "express";
import {
  effectiveModuleScopes,
  hasModuleScope,
  type PartnerModuleKey,
} from "../../../shared/partners/index.ts";
import { getPartnerBySlug, listEnabledModuleKeys } from "./partner-scope.ts";
import { findActiveKeyByRaw, touchApiKeyLastUsed } from "./partner-api-keys.ts";

export type ModuleApiRequest = Request & {
  moduleApi: {
    partnerId: string;
    keyId: number;
    keyName: string;
    scopes: Set<string>;
    enabledModules: string[];
  };
};

function extractRawKey(req: Request): string | null {
  const header = req.header("authorization") ?? "";
  if (header.toLowerCase().startsWith("bearer ")) {
    const token = header.slice(7).trim();
    if (token) return token;
  }
  const xKey = req.header("x-api-key");
  if (xKey?.trim()) return xKey.trim();
  return null;
}

/** 校验 API Key，并强制路径 partnerSlug 与 Key 绑定一致 */
export function requirePartnerApiKey() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const raw = extractRawKey(req);
    if (!raw) {
      res.status(401).json({ error: "缺少 API Key", code: "missing_api_key" });
      return;
    }
    const keyRow = await findActiveKeyByRaw(raw);
    if (!keyRow) {
      res.status(401).json({ error: "无效或已吊销的 API Key", code: "invalid_api_key" });
      return;
    }

    const pathSlug = String(req.params.partnerSlug ?? "").trim();
    if (!pathSlug || pathSlug !== keyRow.partnerId) {
      res.status(403).json({ error: "不可跨租户访问", code: "partner_mismatch" });
      return;
    }

    const partner = await getPartnerBySlug(keyRow.partnerId);
    if (!partner || partner.status !== "active") {
      res.status(403).json({ error: "合作方已停用", code: "partner_disabled" });
      return;
    }

    const enabledModules = await listEnabledModuleKeys(keyRow.partnerId);
    const scopes = effectiveModuleScopes(keyRow.scopes ?? [], enabledModules);

    void touchApiKeyLastUsed(keyRow.id);

    const ctx = req as ModuleApiRequest;
    ctx.moduleApi = {
      partnerId: keyRow.partnerId,
      keyId: keyRow.id,
      keyName: keyRow.name,
      scopes,
      enabledModules,
    };
    next();
  };
}

export function requireModuleScope(moduleKey: PartnerModuleKey) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ctx = req as ModuleApiRequest;
    if (!ctx.moduleApi) {
      res.status(500).json({ error: "内部错误" });
      return;
    }
    if (!hasModuleScope(ctx.moduleApi.scopes, moduleKey)) {
      res.status(403).json({
        error: `缺少模块 scope：module:${moduleKey}`,
        code: "module_scope_denied",
      });
      return;
    }
    next();
  };
}

export function requireConfigWrite() {
  return (req: Request, res: Response, next: NextFunction) => {
    const ctx = req as ModuleApiRequest;
    if (!ctx.moduleApi?.scopes.has("config:write")) {
      res.status(403).json({ error: "缺少 config:write", code: "write_denied" });
      return;
    }
    next();
  };
}
