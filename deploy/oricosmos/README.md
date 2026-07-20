# OriCosmos 并行环境部署

与 **orasage.com 生产（旧 VPS `34.75.40.67`）并存**。本环境：

| 项 | 值 |
|----|-----|
| 域名 | `oricosmos.com` + 子域 |
| 分支 | `cursor/wold-a564` |
| 机器 | 新 Google VM（勿 SSH 到旧机） |
| Nginx | [`deploy/nginx/oricosmos.conf`](../nginx/oricosmos.conf) |
| Env 模板 | [`deploy/.env.oricosmos.example`](../.env.oricosmos.example) |

**禁止**把本目录配置拷到旧生产，或改指向旧机的 DNS / Secrets。

## 域名映射

| 主机 | 端口 | App |
|------|------|-----|
| `oricosmos.com` | 3100 | main |
| `www.oricosmos.com` | — | 301 → apex |
| `auth.oricosmos.com` | 3101 | auth |
| `shop.oricosmos.com` | 3102 | shop |
| `admin.oricosmos.com` | 3103 | admin；`/cms/` → 3120 |
| `bazi.oricosmos.com` | 3110 | bazi |
| `ziwei.oricosmos.com` | 3111 | ziwei |
| `tarot.oricosmos.com` | 3112 | tarot |
| `cms.oricosmos.com` | — | 301 → admin |

## 1. DNS

全部 A 记录 → **新 VM 公网 IP**（TTL 可先 300）：

```
@  www  auth  shop  admin  bazi  ziwei  tarot  cms
```

或 `* → 新IP`。不要改 `orasage.com` 任何记录。

```bash
dig +short oricosmos.com
dig +short auth.oricosmos.com
```

## 2. 防火墙

放行 `80` / `443`；SSH 用 `22` 或 IAP。

## 3. 新机初始化

```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx git curl \
  postgresql postgresql-contrib

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo corepack enable

sudo pg_lsclusters
# 按实际版本启动，例如：
sudo pg_ctlcluster 16 main start

sudo -u postgres psql <<'SQL'
CREATE USER orasage WITH PASSWORD '换成强密码';
CREATE DATABASE orasage_auth OWNER orasage;
CREATE DATABASE orasage_cms  OWNER orasage;
CREATE DATABASE orasage_bazi OWNER orasage;
CREATE DATABASE orasage_tarot OWNER orasage;
SQL
```

## 4. 代码（wold 分支）

```bash
sudo mkdir -p /opt/orasage
sudo chown "$USER:$USER" /opt/orasage
git clone --branch cursor/wold-a564 \
  https://github.com/abutang-droid/orasage.git /opt/orasage
cd /opt/orasage
```

## 5. 环境变量

```bash
cp deploy/.env.oricosmos.example .env
# 编辑 .env：JWT_SECRET、DATABASE_URL 密码、其余 URL 已是 oricosmos

cp bazi/.env.example bazi/.env
cp tarot/.env.example tarot/.env
cp ziwei/.env.example ziwei/.env
cp cms/.env.example cms/.env
```

各 App `.env` 中：`JWT_SECRET` / `JWT_COOKIE_DOMAIN=.oricosmos.com` 与根目录一致；`DATABASE_URL` 各库独立；cms 另设 `PAYLOAD_SECRET`。

## 6. Nginx + SSL

DNS 生效后：

```bash
# 无证书时先用 HTTP bootstrap 申请证书
sudo cp deploy/nginx/oricosmos-http-bootstrap.conf \
  /etc/nginx/sites-available/oricosmos
sudo ln -sf /etc/nginx/sites-available/oricosmos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx \
  -d oricosmos.com -d www.oricosmos.com \
  -d auth.oricosmos.com -d shop.oricosmos.com -d admin.oricosmos.com \
  -d bazi.oricosmos.com -d ziwei.oricosmos.com -d tarot.oricosmos.com \
  -d cms.oricosmos.com

# 再换成完整 HTTPS 配置（证书目录名以 certbot 输出为准）
sudo cp deploy/nginx/oricosmos.conf /etc/nginx/sites-available/oricosmos
sudo nginx -t && sudo systemctl reload nginx
```

若证书路径不是 `/etc/letsencrypt/live/oricosmos.com/`，改 `oricosmos.conf` 里两处 `ssl_certificate*`。

## 7. 部署应用

```bash
cd /opt/orasage
ORASAGE_REF=cursor/wold-a564 FORTUNE_MODE=native \
  bash deploy/bootstrap-all-on-vps.sh
```

首次未齐 `.env` 时可：

```bash
ORASAGE_REF=cursor/wold-a564 FORTUNE_MODE=proxy SKIP_CMS=1 \
  bash deploy/bootstrap-all-on-vps.sh
```

从本机远程打**新机**时必须带新 IP（默认会打到旧生产）：

```bash
SSH_HOST=<新VM公网IP> SSH_USER=ubuntu \
ORASAGE_REF=cursor/wold-a564 \
bash deploy/remote-deploy-all.sh
```

## 8. 验证

```bash
for d in oricosmos.com auth.oricosmos.com shop.oricosmos.com \
         admin.oricosmos.com bazi.oricosmos.com \
         ziwei.oricosmos.com tarot.oricosmos.com; do
  echo -n "$d → "
  curl -s -o /dev/null -w "%{http_code}\n" --max-time 10 "https://$d"
done
```

CMS 首次管理员：`https://admin.oricosmos.com/cms/admin`
