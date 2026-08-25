# OraSage · Google Cloud 重建部署手册

旧 VPS `34.75.40.67`（实例 `cloud-pc-cknotproylkasckrer1aejq45`）已无法 SSH（22 超时，业务约 502）。  
本手册用于在 **GCP Compute Engine** 上拉起**新实例**并恢复全站（方案 B：单机 + Nginx 子域名）。

## 关联影响（部署穿透）

| 层级 | 影响 |
|------|------|
| 基础设施 | 新 GCE VM、防火墙、静态/临时外网 IP |
| DNS | `orasage.com` 及全部子域 A 记录改指向新 IP |
| App | `main` `auth` `shop` `admin` `bazi` `ziwei` `tarot` `cms` 均在同一机 |
| 密钥 | GitHub Actions / Cursor Secrets：`SSH_HOST`、`GCP_INSTANCE`（及可选 `GCP_SA_KEY`） |
| 数据 | **旧盘数据默认不自动迁移**；需快照/SQL 导出或接受空库重建 |

不改动各 App 业务代码；仅部署链路与运维文档。

---

## 0. 前置

本机或 Cloud Shell 已安装并登录 `gcloud`：

```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

准备：

1. 一对 SSH 密钥（公钥写入实例，私钥留给 Cursor / GitHub Secrets）
2. 域名管理权（Cloudflare / 注册商），可改 A 记录
3. 应用密钥材料：`JWT_SECRET`、Stripe（如启用）、各 `DATABASE_URL`、CMS `PAYLOAD_SECRET` 等

---

## 1. 创建新实例

在仓库根目录：

```bash
chmod +x deploy/gcp/create-instance.sh deploy/gcp/startup-orasage.sh

export GCP_PROJECT=YOUR_GCP_PROJECT_ID
export GCP_ZONE=us-east1-b          # 可改
export INSTANCE_NAME=orasage-prod
export MACHINE_TYPE=e2-standard-2   # 生产建议 e2-standard-4
export SSH_PUBKEY="$(cat ~/.ssh/orasage_deploy.pub)"  # 改成你的公钥路径

bash deploy/gcp/create-instance.sh
```

脚本会：

- 创建 Ubuntu 22.04 `e2-standard-2`（可调）
- 打上 `http-server,https-server,orasage-ssh` 标签
- 注入 `startup-orasage.sh`：安装 Node 22 / Nginx / Redis / PostgreSQL，建库，克隆 `/opt/orasage`
- 打印 **外网 IP**

查看 startup 日志：

```bash
gcloud compute ssh "$INSTANCE_NAME" --zone="$GCP_ZONE" --project="$GCP_PROJECT" \
  --command='sudo tail -n 100 /var/log/orasage-startup.log'
```

Postgres 初始密码在实例上：

```bash
gcloud compute ssh "$INSTANCE_NAME" --zone="$GCP_ZONE" --project="$GCP_PROJECT" \
  --command='sudo cat /root/orasage-pg-password'
```

---

## 2. 域名指到新 IP

将下列主机 **A 记录** 改为新实例外网 IP（TTL 可先调短）：

- `orasage.com` / `www.orasage.com`
- `auth.orasage.com` `shop.orasage.com` `admin.orasage.com`
- `bazi.orasage.com` `ziwei.orasage.com` `tarot.orasage.com` `cms.orasage.com`

验证：

```bash
dig +short orasage.com
dig +short auth.orasage.com
```

---

## 3. 配置各 App `.env`（在 VM 上）

```bash
gcloud compute ssh "$INSTANCE_NAME" --zone="$GCP_ZONE" --project="$GCP_PROJECT"
# 或: ssh -i ~/.ssh/orasage_deploy ubuntu@NEW_IP

cd /opt/orasage
PG_PASS=$(sudo cat /root/orasage-pg-password)
JWT_SECRET='请换成≥32字符随机串'

# auth
cp -n auth-service/.env.example auth-service/.env 2>/dev/null || true
# 确保 DATABASE_URL / JWT_SECRET / HOST=127.0.0.1

# shop / admin / main / cms / bazi / tarot — 按各目录 .env.example
# DATABASE_URL 示例：
#   postgresql://orasage:${PG_PASS}@127.0.0.1:5432/orasage_auth
#   postgresql://orasage:${PG_PASS}@127.0.0.1:5432/orasage_bazi
#   …
```

共享约定：

- 所有命理 / shop / admin 的 `JWT_SECRET` **必须与 auth-service 相同**
- Cookie 域：`.orasage.com`
- 进程只绑 `127.0.0.1`，公网只走 Nginx

---

## 4. SSL + 全量部署

DNS 生效后，在 VM：

```bash
cd /opt/orasage
sudo bash deploy/vps-setup.sh
# 或仅证书：
# sudo certbot --nginx -d orasage.com -d www.orasage.com \
#   -d auth.orasage.com -d shop.orasage.com -d admin.orasage.com \
#   -d bazi.orasage.com -d ziwei.orasage.com -d tarot.orasage.com \
#   -d cms.orasage.com

# 全量 App
ORASAGE_REF=main bash deploy/bootstrap-all-on-vps.sh
```

若命理 App 暂无 `.env`，可先：

```bash
FORTUNE_MODE=proxy SKIP_CMS=1 bash deploy/bootstrap-all-on-vps.sh
```

---

## 5. 更新自动化 Secrets

| 位置 | 变量 | 新值 |
|------|------|------|
| GitHub Actions | `SSH_HOST` | 新外网 IP |
| GitHub Actions | `GCP_INSTANCE` | `orasage-prod`（或你起的名字） |
| GitHub Actions | `GCP_ZONE` / `GCP_PROJECT` | 与新实例一致 |
| Cursor Cloud Agents | `SSH_PRIVATE_KEY` | 与写入实例的公钥配对 |
| Cursor / GitHub | `SSH_HOST` | 同上 |

IAP 仍推荐保留（Actions 常连不上直连 22）：见 [`GITHUB-ACTIONS-SETUP.md`](./GITHUB-ACTIONS-SETUP.md)。

远程触发：

```bash
SSH_HOST=NEW_IP SSH_KEY=~/.ssh/orasage_deploy bash deploy/remote-deploy-all.sh
```

---

## 6. 验收

```bash
for d in orasage.com auth.orasage.com shop.orasage.com admin.orasage.com \
         bazi.orasage.com ziwei.orasage.com tarot.orasage.com cms.orasage.com; do
  echo -n "$d → "; curl -s -o /dev/null -w "%{http_code}\n" --max-time 15 "https://$d"
done

ssh ubuntu@NEW_IP 'sudo systemctl --no-pager --type=service | grep orasage'
```

期望：门户/认证/商城等为 `200`/`302`/`307`；systemd 中 `orasage-*` 为 `active`。

---

## 7. 旧实例处理

- **有数据**：先对旧盘做快照 / `pg_dump`，再销毁旧 VM。  
  旧机 SSH 不通时，可在 GCP 控制台挂旧盘到临时机导出，或对旧实例用 **串口/可恢复快照**。
- **可放弃数据**：DNS 切走并验证新站后，停止并删除旧实例，回收 IP。

---

## 故障速查

| 现象 | 处理 |
|------|------|
| startup 无日志 | `gcloud compute instances get-serial-port-output INSTANCE --zone=ZONE` |
| certbot 失败 | 确认 A 记录已指向新 IP；80 端口防火墙放行 |
| App 502 | `journalctl -u orasage-xxx -n 80`；检查 `.env` 与 `127.0.0.1:端口` |
| Actions SSH 超时 | 配 `GCP_SA_KEY` + IAP，或临时放宽 `orasage-ssh` 源网段 |

---

## 相关脚本

| 路径 | 作用 |
|------|------|
| `deploy/gcp/create-instance.sh` | 创建 GCE 实例 |
| `deploy/gcp/startup-orasage.sh` | 实例首次启动装依赖/库/克隆仓库 |
| `deploy/bootstrap-all-on-vps.sh` | 本机全量部署 8 App |
| `deploy/vps-setup.sh` | Nginx + Let’s Encrypt |
| `deploy/remote-deploy-all.sh` | 从外网 SSH 触发全量部署 |
