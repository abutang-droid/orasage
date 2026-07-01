import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, initDb } from './db.js';
import { users } from './schema.js';
import {
  authMiddleware,
  clearAuthCookie,
  getTokenFromRequest,
  setAuthCookie,
  signToken,
  verifyToken,
} from './auth.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3101);

const ALLOWED_REDIRECT_HOSTS = [
  'orasage.com', 'www.orasage.com',
  'auth.orasage.com', 'shop.orasage.com', 'admin.orasage.com',
  'bazi.orasage.com', 'ziwei.orasage.com', 'tarot.orasage.com', 'cms.orasage.com',
];

function safeRedirect(url?: string): string {
  if (!url) return 'https://orasage.com';
  try {
    const parsed = new URL(url);
    if (ALLOWED_REDIRECT_HOSTS.includes(parsed.hostname)) return url;
  } catch { /* ignore */ }
  return 'https://orasage.com';
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nickname: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const profileSchema = z.object({
  nickname: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  birthHour: z.number().int().min(0).max(23).optional().nullable(),
  birthPlaceProvince: z.string().optional().nullable(),
  birthPlaceCity: z.string().optional().nullable(),
  birthplaceLongitude: z.number().optional().nullable(),
  gender: z.string().optional().nullable(),
  preferredDeity: z.string().optional().nullable(),
  languagePreference: z.string().optional().nullable(),
});

function publicUser(u: typeof users.$inferSelect) {
  return {
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    avatarUrl: u.avatarUrl,
    birthDate: u.birthDate,
    birthHour: u.birthHour,
    birthPlaceProvince: u.birthPlaceProvince,
    birthPlaceCity: u.birthPlaceCity,
    birthplaceLongitude: u.birthplaceLongitude,
    gender: u.gender,
    preferredDeity: u.preferredDeity,
    languagePreference: u.languagePreference,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastSignedIn: u.lastSignedIn,
  };
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.redirect('/login');
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'orasage-auth' });
});

app.get('/verify', async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ valid: false });
    const payload = await verifyToken(token);
    res.json({ valid: true, userId: payload.sub, role: payload.role });
  } catch {
    res.status(401).json({ valid: false });
  }
});

app.get('/login', (req, res) => {
  const redirect = safeRedirect(typeof req.query.redirect === 'string' ? req.query.redirect : undefined);
  res.type('html').send(`<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>OraSage 登录</title>
<style>body{font-family:sans-serif;max-width:400px;margin:80px auto;padding:0 20px}
input{display:block;width:100%;margin:8px 0;padding:10px;box-sizing:border-box}
button{width:100%;padding:12px;background:#4a3728;color:#fff;border:none;cursor:pointer;margin-top:8px}
h1{font-size:1.4rem}</style></head><body>
<h1>OraSage 登录</h1>
<form id="f"><input type="email" name="email" placeholder="邮箱" required>
<input type="password" name="password" placeholder="密码" required>
<button type="submit">登录</button></form>
<p>没有账号？<a href="/register?redirect=${encodeURIComponent(redirect)}">注册</a></p>
<script>
document.getElementById('f').onsubmit=async(e)=>{e.preventDefault();
const d=Object.fromEntries(new FormData(e.target));
const r=await fetch('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},
credentials:'include',body:JSON.stringify(d)});
if(r.ok)location.href=${JSON.stringify(redirect)};else alert((await r.json()).error||'登录失败');};
</script></body></html>`);
});

app.get('/register', (req, res) => {
  const redirect = safeRedirect(typeof req.query.redirect === 'string' ? req.query.redirect : undefined);
  res.type('html').send(`<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>OraSage 注册</title>
<style>body{font-family:sans-serif;max-width:400px;margin:80px auto;padding:0 20px}
input{display:block;width:100%;margin:8px 0;padding:10px;box-sizing:border-box}
button{width:100%;padding:12px;background:#4a3728;color:#fff;border:none;cursor:pointer;margin-top:8px}</style></head><body>
<h1>OraSage 注册</h1>
<form id="f"><input type="email" name="email" placeholder="邮箱" required>
<input type="password" name="password" placeholder="密码（至少6位）" required minlength="6">
<input type="text" name="nickname" placeholder="昵称（可选）">
<button type="submit">注册</button></form>
<script>
document.getElementById('f').onsubmit=async(e)=>{e.preventDefault();
const d=Object.fromEntries(new FormData(e.target));
const r=await fetch('/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},
credentials:'include',body:JSON.stringify(d)});
if(r.ok)location.href=${JSON.stringify(redirect)};else alert((await r.json()).error||'注册失败');};
</script></body></html>`);
});

app.post('/auth/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (existing.length) return res.status(409).json({ error: 'email already exists' });

    const passwordHash = await bcrypt.hash(body.password, 10);
    const [user] = await db.insert(users).values({
      email: body.email,
      passwordHash,
      nickname: body.nickname ?? body.email.split('@')[0],
      lastSignedIn: new Date(),
    }).returning();

    const token = await signToken(user.id, user.role);
    setAuthCookie(res, token);
    res.status(201).json({ user: publicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors });
    console.error(e);
    res.status(500).json({ error: 'internal error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    await db.update(users).set({ lastSignedIn: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
    const token = await signToken(user.id, user.role);
    setAuthCookie(res, token);
    res.json({ user: publicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors });
    res.status(500).json({ error: 'internal error' });
  }
});

app.post('/auth/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, Number(req.user!.sub))).limit(1);
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json({ user: publicUser(user) });
});

app.put('/auth/profile', authMiddleware, async (req, res) => {
  try {
    const body = profileSchema.parse(req.body);
    const [user] = await db.update(users).set({
      ...body,
      updatedAt: new Date(),
    }).where(eq(users.id, Number(req.user!.sub))).returning();
    res.json({ user: publicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors });
    res.status(500).json({ error: 'internal error' });
  }
});

app.get('/auth/profile/:userId', async (req, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, Number(req.params.userId))).limit(1);
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json({ user: publicUser(user) });
});

async function main() {
  await initDb();
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`auth service listening on 127.0.0.1:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
