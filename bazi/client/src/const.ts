export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const trim = (value: unknown) => (typeof value === "string" ? value.trim() : "");

// Generate login URL at runtime so redirect URI reflects the current origin.
// 未配置 Manus OAuth 时，回退到 orasage 统一认证中心（与 ziwei/tarot 一致）。
export const getLoginUrl = (returnPath?: string) => {
  const oauthPortalUrl = trim(import.meta.env.VITE_OAUTH_PORTAL_URL);
  const appId = trim(import.meta.env.VITE_APP_ID);
  const authUrl = trim(import.meta.env.VITE_AUTH_URL) || "https://auth.orasage.com";
  const redirectTarget =
    returnPath ??
    (typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}${window.location.search}`
      : "https://bazi.orasage.com/");

  if (!oauthPortalUrl) {
    const url = new URL("/login", authUrl.endsWith("/") ? authUrl : `${authUrl}/`);
    url.searchParams.set("redirect", redirectTarget);
    return url.toString();
  }

  const redirectUri = `${typeof window !== "undefined" ? window.location.origin : "https://bazi.orasage.com"}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL("/app-auth", oauthPortalUrl.endsWith("/") ? oauthPortalUrl : `${oauthPortalUrl}/`);
  if (appId) url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
