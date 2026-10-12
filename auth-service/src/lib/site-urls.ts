import { buildSiteUrls, getSiteRootDomain, siteAllowedHosts } from "../../../shared/site-domain.ts";

export function siteRoot(): string {
  return getSiteRootDomain();
}

export function urls() {
  return buildSiteUrls(siteRoot());
}

export function allowedRedirectHosts(): string[] {
  // 同时接受旧域与当前域，避免切换窗口期登录回跳被拒
  const roots = Array.from(
    new Set([siteRoot(), "orasage.com", "orcos.win"].filter(Boolean)),
  );
  return roots.flatMap((root) => siteAllowedHosts(root));
}
