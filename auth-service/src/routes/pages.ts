import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuthUser } from "../lib/auth-user.ts";
import { authPageCopy } from "../lib/auth-page-copy.ts";
import { authPageLayout } from "../lib/site-chrome-html.ts";
import { resolveAuthPageLocale } from "../lib/resolve-page-locale.ts";

export const pagesRouter = Router();

const ALLOWED_HOSTS = [
  "orasage.com",
  "auth.orasage.com",
  "admin.orasage.com",
  "shop.orasage.com",
  "bazi.orasage.com",
  "ziwei.orasage.com",
  "tarot.orasage.com",
];

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
        <header class="auth-card-header">
          <h1 class="auth-card-title">${c.loginTitle}</h1>
          <p class="auth-card-lead">${c.loginLead}</p>
        </header>
        <div class="auth-card-body">
          <form id="login-form" class="auth-form" data-redirect="${esc(redirect)}">
            <div class="auth-field">
              <label class="auth-label" for="login-email">${c.email}</label>
              <input id="login-email" class="auth-input" type="email" name="email" required autocomplete="email" placeholder="${esc(c.emailPlaceholder)}">
            </div>
            <div class="auth-field">
              <label class="auth-label" for="login-password">${c.password}</label>
              <input id="login-password" class="auth-input" type="password" name="password" required autocomplete="current-password" placeholder="${esc(c.passwordPlaceholder)}">
            </div>
            <p id="form-error" class="auth-error" role="alert" hidden></p>
            <button type="submit" class="auth-submit">${c.loginBtn}</button>
          </form>
          <footer class="auth-card-footer">
            <p class="auth-switch">${c.loginSwitch}<a href="/register?redirect=${encodeURIComponent(redirect)}">${c.loginSwitchLink}</a></p>
          </footer>
        </div>
      </div>
    </main>`;
}

function registerCardHtml(locale: string, redirect: string): string {
  const c = authPageCopy(locale);
  return `
    <main class="auth-page">
      <div class="auth-card">
        <header class="auth-card-header">
          <h1 class="auth-card-title">${c.registerTitle}</h1>
          <p class="auth-card-lead">${c.registerLead}</p>
        </header>
        <div class="auth-card-body">
          <form id="register-form" class="auth-form" data-redirect="${esc(redirect)}">
            <div class="auth-field">
              <label class="auth-label" for="reg-email">${c.email}</label>
              <input id="reg-email" class="auth-input" type="email" name="email" required autocomplete="email" placeholder="${esc(c.emailPlaceholder)}">
            </div>
            <div class="auth-field">
              <label class="auth-label" for="reg-nickname">${c.nickname}</label>
              <input id="reg-nickname" class="auth-input" type="text" name="nickname" placeholder="${esc(c.nicknamePlaceholder)}" autocomplete="nickname">
            </div>
            <div class="auth-field">
              <label class="auth-label" for="reg-password">${c.password}</label>
              <input id="reg-password" class="auth-input" type="password" name="password" required minlength="6" autocomplete="new-password" placeholder="${esc(c.passwordPlaceholder)}">
            </div>
            <p id="form-error" class="auth-error" role="alert" hidden></p>
            <button type="submit" class="auth-submit">${c.registerBtn}</button>
          </form>
          <footer class="auth-card-footer">
            <p class="auth-switch">${c.registerSwitch}<a href="/login?redirect=${encodeURIComponent(redirect)}">${c.registerSwitchLink}</a></p>
          </footer>
        </div>
      </div>
    </main>`;
}

pagesRouter.get("/", (_req, res) => res.redirect("/center"));

pagesRouter.get("/login", (req, res) => {
  const redirectParamValue = redirectParam(req);
  const redirect = safeRedirect(redirectParamValue);
  const locale = resolveAuthPageLocale(req, redirectParamValue ?? redirect);
  const c = authPageCopy(locale);
  res.send(authPageLayout(c.loginTitle, loginCardHtml(locale, redirect), locale));
});

pagesRouter.get("/register", (req, res) => {
  const redirectParamValue = redirectParam(req);
  const redirect = safeRedirect(redirectParamValue);
  const locale = resolveAuthPageLocale(req, redirectParamValue ?? redirect);
  const c = authPageCopy(locale);
  res.send(authPageLayout(c.registerTitle, registerCardHtml(locale, redirect), locale));
});

pagesRouter.get("/center", async (req, res) => {
  const user = await getAuthUser(req);
  const locale = resolveAuthPageLocale(req);
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
