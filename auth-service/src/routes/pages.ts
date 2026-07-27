import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuthUser } from "../lib/auth-user.ts";
import { authPageCopy } from "../lib/auth-page-copy.ts";
import { authPageLayout } from "../lib/site-chrome-html.ts";
import { resolveAuthPageLocale } from "../lib/resolve-page-locale.ts";
import { allowedRedirectHosts, isAdminLoginRedirect, siteApex, siteUrls } from "../lib/site-urls.ts";
import { ENV } from "../env.ts";

export const pagesRouter = Router();

function worldLoginCardHtml(locale: string, redirect: string): string {
  const title =
    locale.startsWith("zh") ? "使用 World 登录" : locale.startsWith("pt") ? "Entrar com World" : "Sign in with World";
  const lead =
    locale.startsWith("zh")
      ? "本站仅支持 World App 钱包登录；支付走 World 钱包（WLD）。"
      : locale.startsWith("pt")
        ? "Este site exige conta World App. Pagamentos usam a carteira World (WLD)."
        : "This site requires a World App account. Payments use your World wallet (WLD).";
  const cta =
    locale.startsWith("zh") ? "继续使用 World" : locale.startsWith("pt") ? "Continuar com World" : "Continue with World";
  const hint =
    locale.startsWith("zh")
      ? "请在 World App 内打开本站以完成登录。"
      : locale.startsWith("pt")
        ? "Abra este site no World App para entrar."
        : "Open this site inside World App to sign in.";
  return `
    <main class="auth-page">
      <div class="auth-card">
        <header class="auth-card-header">
          <h1 class="auth-card-title">${esc(title)}</h1>
          <p class="auth-card-lead">${esc(lead)}</p>
        </header>
        <div class="auth-card-body">
          <p class="auth-error" id="world-login-error" hidden role="alert"></p>
          <p class="auth-switch" style="margin-bottom:1rem">${esc(hint)}</p>
          <button type="button" class="auth-submit" id="world-login-btn"
            data-redirect="${esc(redirect)}">${esc(cta)}</button>
        </div>
      </div>
    </main>
    <script type="module">
      import { MiniKit } from 'https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@2.0.3/+esm';
      const btn = document.getElementById('world-login-btn');
      const errEl = document.getElementById('world-login-error');
      const redirect = btn?.dataset.redirect || '/';
      const appId = ${JSON.stringify(ENV.worldAppId || '')};
      btn?.addEventListener('click', async () => {
        errEl.hidden = true;
        btn.disabled = true;
        try {
          MiniKit.install(appId || undefined);
          if (!MiniKit.isInstalled()) throw new Error('Open this page inside World App');
          const nonceRes = await fetch('/auth/world/nonce', { credentials: 'include' });
          const { nonce } = await nonceRes.json();
          const statement = 'Sign in to OriCosmos with your World wallet';
          const result = await MiniKit.walletAuth({
            nonce,
            statement,
            expirationTime: new Date(Date.now() + 3600000),
          });
          if (result.executedWith === 'fallback') throw new Error('Open this page inside World App');
          const complete = await fetch('/auth/world/siwe', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: result.data, nonce, statement }),
          });
          const data = await complete.json();
          if (!complete.ok) throw new Error(data.error || 'Login failed');
          window.location.href = redirect;
        } catch (e) {
          errEl.textContent = e?.message || 'Login failed';
          errEl.hidden = false;
          btn.disabled = false;
        }
      });
    </script>`;
}

function safeRedirect(url: string | undefined, locale: string): string {
  const apex = siteApex();
  const fallback = `${siteUrls(apex).main}/${locale}/profile`;
  if (!url) return fallback;
  try {
    const u = new URL(url);
    const allowed = allowedRedirectHosts(apex);
    if (allowed.includes(u.hostname) || u.hostname.endsWith(`.${apex}`)) return url;
  } catch {
    if (url.startsWith("/")) return url;
  }
  return fallback;
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

function loginCardHtml(
  locale: string,
  redirect: string,
  opts: { allowRegister?: boolean } = {},
): string {
  const c = authPageCopy(locale);
  const allowRegister = opts.allowRegister !== false;
  const footer = allowRegister
    ? `<footer class="auth-card-footer">
            <p class="auth-switch">${c.loginSwitch}<a id="login-register-link" href="/register?redirect=${encodeURIComponent(redirect)}">${c.loginSwitchLink}</a></p>
          </footer>`
    : `<footer class="auth-card-footer">
            <p class="auth-switch">${esc(
              locale.startsWith("zh")
                ? "运营后台账号由管理员开通，不开放自助注册。"
                : locale.startsWith("pt")
                  ? "Contas do admin são criadas pelo administrador. Sem auto-cadastro."
                  : "Admin accounts are provisioned by an administrator. Self-registration is closed.",
            )}</p>
          </footer>`;
  const emailChoice = allowRegister
    ? `<div id="login-email-choice" class="auth-choice" hidden role="region" aria-live="polite">
              <p class="auth-choice-title"></p>
              <p class="auth-choice-lead"></p>
              <button type="button" id="login-choice-register" class="auth-submit">${esc(c.emailNotFoundRegister)}</button>
              <button type="button" id="login-choice-retry" class="auth-submit auth-submit--secondary">${esc(c.emailNotFoundRetryPassword)}</button>
            </div>`
    : "";
  return `
    <main class="auth-page">
      <div class="auth-card">
        <header class="auth-card-header">
          <h1 class="auth-card-title">${c.loginTitle}</h1>
          <p class="auth-card-lead">${allowRegister ? c.loginLead : esc(
            locale.startsWith("zh")
              ? "使用运营账号邮箱与密码登录后台。"
              : locale.startsWith("pt")
                ? "Entre com o e-mail e a senha da conta operacional."
                : "Sign in with your staff email and password.",
          )}</p>
        </header>
        <div class="auth-card-body">
          <form id="login-form" class="auth-form" data-redirect="${esc(redirect)}"
            data-allow-register="${allowRegister ? "1" : "0"}"
            data-msg-invalid-password="${esc(c.invalidPassword)}"
            data-msg-email-not-found-title="${esc(c.emailNotFoundTitle)}"
            data-msg-email-not-found-lead="${esc(c.emailNotFoundLead)}"
            data-msg-email-not-found="${esc(
              locale.startsWith("zh")
                ? "该邮箱未注册或不是运营账号。"
                : locale.startsWith("pt")
                  ? "E-mail não cadastrado ou sem acesso operacional."
                  : "Email is not registered or is not a staff account.",
            )}"
            data-label-register="${esc(c.emailNotFoundRegister)}"
            data-label-retry-password="${esc(c.emailNotFoundRetryPassword)}">
            <div class="auth-field">
              <label class="auth-label" for="login-email">${c.email}</label>
              <input id="login-email" class="auth-input" type="email" name="email" required autocomplete="email" placeholder="${esc(c.emailPlaceholder)}">
            </div>
            <div class="auth-field">
              <label class="auth-label" for="login-password">${c.password}</label>
              <input id="login-password" class="auth-input" type="password" name="password" required autocomplete="current-password" placeholder="${esc(c.passwordPlaceholder)}">
            </div>
            <p id="form-error" class="auth-error" role="alert" hidden></p>
            ${emailChoice}
            <button type="submit" class="auth-submit" id="login-submit">${c.loginBtn}</button>
          </form>
          ${footer}
        </div>
      </div>
    </main>`;
}

function registerCardHtml(locale: string, redirect: string, email = ''): string {
  const c = authPageCopy(locale);
  const emailValue = email ? ` value="${esc(email)}"` : '';
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
              <input id="reg-email" class="auth-input" type="email" name="email" required autocomplete="email" placeholder="${esc(c.emailPlaceholder)}"${emailValue}>
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

function prefillEmail(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const email = raw.trim().slice(0, 320);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '';
  return email;
}

pagesRouter.get("/", (_req, res) => res.redirect("/center"));

pagesRouter.get("/login", (req, res) => {
  const redirectParamValue = redirectParam(req);
  // Detect from the user-provided redirect only — the hardcoded fallback used
  // to force zh-CN and shadow ?lang / the shared NEXT_LOCALE cookie.
  const locale = resolveAuthPageLocale(req, redirectParamValue);
  const redirect = safeRedirect(redirectParamValue, locale);
  const c = authPageCopy(locale);
  if (ENV.worldAuthRequired) {
    // Staff exception: admin console may use email/password from the public web.
    // Self-registration stays closed.
    if (isAdminLoginRedirect(redirect)) {
      res.send(
        authPageLayout(
          c.loginTitle,
          loginCardHtml(locale, redirect, { allowRegister: false }),
          locale,
        ),
      );
      return;
    }
    // MiniKit.walletAuth must run on the registered Mini App origin (tarot),
    // not auth.*. World App rejects / fails walletAuth on the wrong host.
    const tarot = siteUrls().tarot.replace(/\/$/, "");
    let target = `${tarot}/?world_login=1`;
    try {
      const u = new URL(redirect);
      if (u.hostname === new URL(tarot).hostname) {
        u.searchParams.set("world_login", "1");
        target = u.toString();
      } else {
        target = `${tarot}/?world_login=1&redirect=${encodeURIComponent(redirect)}`;
      }
    } catch {
      target = `${tarot}/?world_login=1&redirect=${encodeURIComponent(redirect)}`;
    }
    res.redirect(302, target);
    return;
  }
  res.send(authPageLayout(c.loginTitle, loginCardHtml(locale, redirect), locale));
});

pagesRouter.get("/register", (req, res) => {
  const redirectParamValue = redirectParam(req);
  const locale = resolveAuthPageLocale(req, redirectParamValue);
  const redirect = safeRedirect(redirectParamValue, locale);
  if (ENV.worldAuthRequired) {
    const title =
      locale.startsWith("zh") ? "暂不开放注册" : locale.startsWith("pt") ? "Cadastro fechado" : "Registration closed";
    const lead = isAdminLoginRedirect(redirect)
      ? locale.startsWith("zh")
        ? "运营后台账号由管理员开通。请返回登录页使用已有账号。"
        : locale.startsWith("pt")
          ? "Contas do admin são criadas pelo administrador. Volte e entre com uma conta existente."
          : "Admin accounts are provisioned by an administrator. Please return and sign in with an existing account."
      : locale.startsWith("zh")
        ? "本站仅支持 World App 登录，不开放邮箱自助注册。"
        : locale.startsWith("pt")
          ? "Este site exige World App. Cadastro por e-mail não está disponível."
          : "This site requires World App sign-in. Email self-registration is closed.";
    const back = locale.startsWith("zh") ? "返回登录" : locale.startsWith("pt") ? "Voltar ao login" : "Back to login";
    const loginHref = isAdminLoginRedirect(redirect)
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : `/login?redirect=${encodeURIComponent(redirect)}`;
    const body = `
    <main class="auth-page">
      <div class="auth-card">
        <header class="auth-card-header">
          <h1 class="auth-card-title">${esc(title)}</h1>
          <p class="auth-card-lead">${esc(lead)}</p>
        </header>
        <div class="auth-card-body">
          <a class="auth-submit" href="${esc(loginHref)}" style="display:inline-block;text-align:center;text-decoration:none">${esc(back)}</a>
        </div>
      </div>
    </main>`;
    res.send(authPageLayout(title, body, locale));
    return;
  }
  const email = prefillEmail(req.query.email);
  const c = authPageCopy(locale);
  res.send(authPageLayout(c.registerTitle, registerCardHtml(locale, redirect, email), locale));
});

pagesRouter.get("/center", async (req, res) => {
  const user = await getAuthUser(req);
  const locale = resolveAuthPageLocale(req);
  const target = `${siteUrls().main}/${locale}/profile`;
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
