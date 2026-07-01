import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuthUser } from "../lib/auth-user.ts";

export const pagesRouter = Router();

const ALLOWED_HOSTS = ["orasage.com", "auth.orasage.com", "shop.orasage.com", "bazi.orasage.com", "ziwei.orasage.com", "tarot.orasage.com"];

function safeRedirect(url?: string): string {
  if (!url) return "/center";
  try {
    const u = new URL(url);
    if (ALLOWED_HOSTS.includes(u.hostname) || u.hostname.endsWith(".orasage.com")) return url;
  } catch {
    if (url.startsWith("/")) return url;
  }
  return "/center";
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover">
  <meta name="theme-color" content="#0f0e17">
  <title>${title} — OraSage</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body><div class="app-shell">${body}</div><script src="/assets/app.js" defer></script></body>
</html>`;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

pagesRouter.get("/", (_req, res) => res.redirect("/center"));

pagesRouter.get("/login", (req, res) => {
  const redirect = safeRedirect(typeof req.query.redirect === "string" ? req.query.redirect : undefined);
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
  const redirect = safeRedirect(typeof req.query.redirect === "string" ? req.query.redirect : undefined);
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
  if (!user) {
    res.redirect("/login?redirect=%2Fcenter");
    return;
  }
  const n = esc(user.nickname || "用户");
  const e = esc(user.email);
  res.send(layout("用户中心", `
    <header class="page-header center-header">
      <a href="https://orasage.com" class="logo">OraSage</a>
      <button type="button" id="logout-btn" class="btn-text">退出</button>
    </header>
    <main class="center-main">
      <section class="user-hero">
        <div class="avatar">${(user.nickname || user.email)[0]?.toUpperCase() ?? "U"}</div>
        <div><h1 id="user-nickname">${n}</h1><p class="muted">${e}</p></div>
      </section>
      <nav class="tab-bar">
        <button type="button" class="tab active" data-tab="profile">基本资料</button>
        <button type="button" class="tab" data-tab="readings">测试记录</button>
        <button type="button" class="tab" data-tab="orders">我的订单</button>
      </nav>
      <section id="panel-profile" class="tab-panel active">
        <form id="profile-form" class="profile-form">
          <label>昵称<input name="nickname" value="${esc(user.nickname || "")}"></label>
          <label>性别<select name="gender">
            <option value="">未设置</option>
            <option value="male" ${user.gender === "male" ? "selected" : ""}>男</option>
            <option value="female" ${user.gender === "female" ? "selected" : ""}>女</option>
          </select></label>
          <label>出生日期<input type="date" name="birthDate" value="${esc(user.birthDate || "")}"></label>
          <label>出生时辰<input name="birthHour" value="${esc(user.birthHour || "")}" placeholder="子时 / 23:00"></label>
          <label>出生省份<input name="birthPlaceProvince" value="${esc(user.birthPlaceProvince || "")}"></label>
          <label>出生城市<input name="birthPlaceCity" value="${esc(user.birthPlaceCity || "")}"></label>
          <label>语言<select name="languagePreference">
            <option value="zh-CN" ${user.languagePreference === "zh-CN" ? "selected" : ""}>简体中文</option>
            <option value="en" ${user.languagePreference === "en" ? "selected" : ""}>English</option>
          </select></label>
          <p id="profile-msg" class="msg" hidden></p>
          <button type="submit" class="btn-primary">保存资料</button>
        </form>
      </section>
      <section id="panel-readings" class="tab-panel">
        <div id="readings-list" class="card-list"><p class="loading">加载中…</p></div>
      </section>
      <section id="panel-orders" class="tab-panel">
        <div id="orders-list" class="card-list"><p class="loading">加载中…</p></div>
      </section>
    </main>`));
});

export function internalOnly(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "";
  if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.endsWith("127.0.0.1")) {
    next();
    return;
  }
  res.status(403).json({ error: "forbidden" });
}
