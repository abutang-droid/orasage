import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuthUser } from "../lib/auth-user.ts";
import { authPageCopy } from "../lib/auth-page-copy.ts";
import { authPageLayout, localeFromRedirect } from "../lib/site-chrome-html.ts";

export const pagesRouter = Router();

const ALLOWED_HOSTS = ["orasage.com", "auth.orasage.com", "shop.orasage.com", "bazi.orasage.com", "ziwei.orasage.com", "tarot.orasage.com"];

function safeRedirect(url?: string): string {
  if (!url) return "https://orasage.com/zh-CN/profile";
  try {
    const u = new URL(url);
    if (ALLOWED_HOSTS.includes(u.hostname) || u.hostname.endsWith(".orasage.com")) return url;
  } catch {
    if (url.startsWith("/")) return url;
  }
  return "https://orasage.com/zh-CN/profile";
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function redirectParam(req: Request): string | undefined {
  return (
    (typeof req.query.redirect === "string" ? req.query.redirect : undefined) ||
    (typeof req.query.returnUrl === "string" ? req.query.returnUrl : undefined)
  );
}

function loginCardHtml(locale: string, redirect: string): string {
  const c = authPageCopy(locale);
  return `
    <main class="auth-page">
      <div class="auth-card">
        <h1 class="auth-card-title">${c.loginTitle}</h1>
        <p class="auth-card-lead">${c.loginLead}</p>
        <form id="login-form" class="auth-form" data-redirect="${esc(redirect)}">
          <div class="oui-field">
            <label for="login-email">${c.email}</label>
            <input id="login-email" class="oui-input" data-size="md" type="email" name="email" required autocomplete="email">
          </div>
          <div class="oui-field">
            <label for="login-password">${c.password}</label>
            <input id="login-password" class="oui-input" data-size="md" type="password" name="password" required autocomplete="current-password">
          </div>
          <p id="form-error" class="oui-field-error" hidden></p>
          <button type="submit" class="oui-btn oui-btn--default" data-size="lg">${c.loginBtn}</button>
        </form>
        <p class="auth-switch">${c.loginSwitch}<a href="/register?redirect=${encodeURIComponent(redirect)}">${c.loginSwitchLink}</a></p>
      </div>
    </main>`;
}

function registerCardHtml(locale: string, redirect: string): string {
  const c = authPageCopy(locale);
  return `
    <main class="auth-page">
      <div class="auth-card">
        <h1 class="auth-card-title">${c.registerTitle}</h1>
        <p class="auth-card-lead">${c.registerLead}</p>
        <form id="register-form" class="auth-form" data-redirect="${esc(redirect)}">
          <div class="oui-field">
            <label for="reg-email">${c.email}</label>
            <input id="reg-email" class="oui-input" data-size="md" type="email" name="email" required autocomplete="email">
          </div>
          <div class="oui-field">
            <label for="reg-nickname">${c.nickname}</label>
            <input id="reg-nickname" class="oui-input" data-size="md" type="text" name="nickname" placeholder="${esc(c.nicknamePlaceholder)}" autocomplete="nickname">
          </div>
          <div class="oui-field">
            <label for="reg-password">${c.password}</label>
            <input id="reg-password" class="oui-input" data-size="md" type="password" name="password" required minlength="6" autocomplete="new-password">
          </div>
          <p id="form-error" class="oui-field-error" hidden></p>
          <button type="submit" class="oui-btn oui-btn--default" data-size="lg">${c.registerBtn}</button>
        </form>
        <p class="auth-switch">${c.registerSwitch}<a href="/login?redirect=${encodeURIComponent(redirect)}">${c.registerSwitchLink}</a></p>
      </div>
    </main>`;
}

pagesRouter.get("/", (_req, res) => res.redirect("/center"));

pagesRouter.get("/login", (req, res) => {
  const redirectParamValue = redirectParam(req);
  const redirect = safeRedirect(redirectParamValue);
  const locale = localeFromRedirect(redirectParamValue ?? redirect);
  const c = authPageCopy(locale);
  res.send(authPageLayout(c.loginTitle, loginCardHtml(locale, redirect), locale));
});

pagesRouter.get("/register", (req, res) => {
  const redirectParamValue = redirectParam(req);
  const redirect = safeRedirect(redirectParamValue);
  const locale = localeFromRedirect(redirectParamValue ?? redirect);
  const c = authPageCopy(locale);
  res.send(authPageLayout(c.registerTitle, registerCardHtml(locale, redirect), locale));
});

pagesRouter.get("/center", async (req, res) => {
  const user = await getAuthUser(req);
  const locale = "zh-CN";
  const target = `https://orasage.com/${locale}/profile`;
  if (!user) {
    res.redirect(`/login?redirect=${encodeURIComponent(target)}`);
    return;
  }
  res.redirect(target);
});

export function internalOnly(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "";
  if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.endsWith("127.0.0.1")) {
    next();
    return;
  }
  res.status(403).json({ error: "forbidden" });
}
