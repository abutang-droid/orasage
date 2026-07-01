# @orasage/auth

命理 App（bazi / ziwei / tarot）接入统一 JWT 登录的共享库。

## 环境变量

与 `auth-service` 和 `shop` 保持一致：

```env
JWT_SECRET=<与 auth-service 相同，≥32 字符>
JWT_COOKIE_NAME=orasage_token
JWT_COOKIE_DOMAIN=.orasage.com
AUTH_URL=https://auth.orasage.com
AUTH_INTERNAL_URL=http://127.0.0.1:3101
```

## Express（bazi 后端）

```typescript
import { orasageAuthOptional, orasageAuthRequired } from '@orasage/auth/express';

app.use(orasageAuthOptional());
app.get('/api/me', orasageAuthRequired('https://bazi.orasage.com'), (req, res) => {
  res.json({ userId: req.orasageUser!.id });
});
```

## Next.js（ziwei / tarot）

```typescript
import { getOrasageUser, loginUrl } from '@orasage/auth/next';

const user = await getOrasageUser();
if (!user) redirect(loginUrl('https://ziwei.orasage.com'));
```

## 本地引用

在各 App 的 `package.json` 中添加：

```json
"dependencies": {
  "@orasage/auth": "file:../packages/orasage-auth"
}
```
