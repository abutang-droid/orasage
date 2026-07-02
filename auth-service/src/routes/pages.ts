import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuthUser } from "../lib/auth-user.ts";
import { bottomNavHtml } from "../lib/bottom-nav-html.ts";

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

function layout(title: string, body: string, locale = "zh-CN"): string {
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover">
  <meta name="theme-color" content="#fafaf8">
  <title>${title} — OraSage</title>
  <link rel="stylesheet" href="/assets/style.css">
  <link rel="stylesheet" href="/assets/app-shell.css">
</head>
<body class="orasage-auth-body"><div class="app-shell orasage-auth-content">${body}</div>${bottomNavHtml(locale)}<script src="/assets/app.js" defer></script></body>
</html>`;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

pagesRouter.get("/", (_req, res) => res.redirect("/center"));

pagesRouter.get("/login", (req, res) => {
  const redirectParam =
    (typeof req.query.redirect === "string" ? req.query.redirect : undefined) ||
    (typeof req.query.returnUrl === "string" ? req.query.returnUrl : undefined);
  const redirect = safeRedirect(redirectParam);
  res.send(layout("登录", `
    <header class="page-header"><a href="https://orasage.com" class="logo">OraSage</a></header>
    <main class="auth-card">
      <h1>登录</h1>
      <p class="subtitle">登录后查看测试记录与订单</p>
      <form id="login-form" data-redirect="${esc(redirect)}">
        <label>邮箱<input type="email" name="email" required autocomplete="email"></label>
        <label>密码<input type="password" name="password" required autocomplete="current-password"></label>
        <p id="form-error" class="error" hidden></p>
        <button type="submit" class="btn-primary">登录</button>
      </form>
      <p class="auth-switch">没有账号？<a href="/register?redirect=${encodeURIComponent(redirect)}">立即注册</a></p>
    </main>`));
});

pagesRouter.get("/register", (req, res) => {
  const redirectParam =
    (typeof req.query.redirect === "string" ? req.query.redirect : undefined) ||
    (typeof req.query.returnUrl === "string" ? req.query.returnUrl : undefined);
  const redirect = safeRedirect(redirectParam);
  res.send(layout("注册", `
    <header class="page-header"><a href="https://orasage.com" class="logo">OraSage</a></header>
    <main class="auth-card">
      <h1>注册</h1>
      <p class="subtitle">创建账号，同步命理测试与订单</p>
      <form id="register-form" data-redirect="${esc(redirect)}">
        <label>邮箱<input type="email" name="email" required autocomplete="email"></label>
        <label>昵称<input type="text" name="nickname" placeholder="可选"></label>
        <label>密码<input type="password" name="password" required minlength="6" autocomplete="new-password"></label>
        <p id="form-error" class="error" hidden></p>
        <button type="submit" class="btn-primary">注册</button>
      </form>
      <p class="auth-switch">已有账号？<a href="/login?redirect=${encodeURIComponent(redirect)}">去登录</a></p>
    </main>`));
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
