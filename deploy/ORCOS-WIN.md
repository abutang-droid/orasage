# 临时公网域名 orcos.win

`orasage.com` 不可用时，用 `orcos.win` 作为同一套源站的公网入口。

## 架构

家用源站仍经 **Cloudflare Tunnel**（`cloudflared` token）暴露本机端口：

| 主机名 | 本机上游 |
|--------|----------|
| `orcos.win` / `www.orcos.win` | `http://127.0.0.1:3100`（main，经 tunnel-split） |
| `auth.orcos.win` | `http://127.0.0.1:3101` |
| `shop.orcos.win` | `http://127.0.0.1:3102` |
| `admin.orcos.win` | `http://127.0.0.1:3103`（含 `/cms` → 3120） |
| `bazi.orcos.win` | `http://127.0.0.1:3110` |
| `ziwei.orcos.win` | `http://127.0.0.1:3111` |
| `tarot.orcos.win` | `http://127.0.0.1:3112` |

## 你必须在 Cloudflare 完成的步骤（否则公网无法解析）

源站 env / cookie / 构建已可切到 `orcos.win`；**token 模式 cloudflared 无法在机器上改 ingress**，须在控制台完成：

1. **DNS**：将 `orcos.win` 接入 Cloudflare（Nameserver 切到 CF），或至少为上表主机名建 **CNAME → 当前 Tunnel**（与 `orasage.com` 同一 Tunnel，UUID `278759d7-07e7-4dab-a48f-dbb069ce0d7c`）。
2. **Zero Trust → Networks → Tunnels → 当前 tunnel → Public Hostname**：按上表逐条添加（Service 填本机 HTTP URL）。`orcos.win` / `www` 指向 `:3100`（nginx tunnel-split → Next `:3105`）。
3. 保存后数分钟内生效。无需在源站再签 Let's Encrypt（边缘证书由 CF 提供）。

## 源站切换（代码已支持 `SITE_ROOT_DOMAIN`）

```bash
# 在生产机 /opt/orasage（或经 Cloud Agent SSH）
cd /opt/orasage
git pull --ff-only origin main
SITE_ROOT_DOMAIN=orcos.win bash deploy/switch-public-domain.sh
```

脚本会：

- 写入各 App `.env`：`SITE_ROOT_DOMAIN` / `NEXT_PUBLIC_ROOT_DOMAIN` / `COOKIE_DOMAIN=.orcos.win` / `CORS_ORIGINS` / 各 `*_URL`
- 重建并重启 auth / main / admin / shop / bazi / ziwei / tarot

只改环境、稍后构建：

```bash
SITE_ROOT_DOMAIN=orcos.win SKIP_BUILD=1 bash deploy/switch-public-domain.sh
```

## 验证

```bash
curl -sI https://orcos.win/zh-CN | head -5
curl -sI https://auth.orcos.win/health | head -5
curl -sI https://admin.orcos.win/channels | head -8
```

登录 cookie 域为 `.orcos.win`，与旧域会话不互通。

## 切回 orasage.com

```bash
SITE_ROOT_DOMAIN=orasage.com bash deploy/switch-public-domain.sh
```
