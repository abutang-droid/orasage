# VPS 全量部署指南

VPS: `34.75.40.67`（GCP e2-standard-2，用户 `ubuntu`）

## 当前线上状态（2026-07-02）

| 子域名 | HTTP | 说明 |
|--------|------|------|
| orasage.com | 307 | ✅ 重定向正常 |
| auth.orasage.com | 302 | ✅ 正常 |
| shop.orasage.com | 200 | ✅ 正常 |
| admin.orasage.com | 200/502 | ⚠️ 骨架，服务已启但功能未完善 |
| bazi.orasage.com | 200 | ✅ native |
| ziwei.orasage.com | 307 | ✅ native |
| tarot.orasage.com | 200 | ✅ native |
| cms.orasage.com | 200 | ✅ Payload CMS（首次访问 /admin 创建管理员） |

## 方式一：GCP 控制台 SSH（推荐，无需本地密钥）

1. 打开 [GCP Console](https://console.cloud.google.com/) → Compute Engine → 实例 → SSH
2. 在 VPS 上执行：

```bash
cd /opt/orasage
git fetch origin main && git checkout main && git pull origin main

# 首次：命理 App 尚无 .env 时用 proxy 保活，cms 跳过
FORTUNE_MODE=proxy SKIP_CMS=1 bash deploy/bootstrap-all-on-vps.sh
```

3. 配置 native 模式所需环境变量后再次部署：

```bash
# bazi
cp /opt/orasage/bazi/.env.example /opt/orasage/bazi/.env
# 编辑 DATABASE_URL（MySQL）和 JWT_SECRET（与 auth-service 相同）

# tarot
cp /opt/orasage/tarot/.env.example /opt/orasage/tarot/.env
# 编辑 DATABASE_URL 和 JWT_SECRET

# 全量 native 部署
FORTUNE_MODE=native bash deploy/bootstrap-all-on-vps.sh
```

## 方式二：Cloud Agent / 本地远程部署

在 [Cursor Cloud Agents → Secrets](https://cursor.com/dashboard/cloud-agents) 添加：

- `SSH_PRIVATE_KEY`（Runtime Secret，完整 PEM 私钥）

**重新启动 Cloud Agent 后**执行：

```bash
bash deploy/remote-deploy-all.sh
```

## 方式三：GitHub Actions

仓库 Secrets 需配置：

| Secret | 必填 | 说明 |
|--------|------|------|
| `SSH_PRIVATE_KEY` | 是 | VPS SSH 私钥 |
| `GCP_SA_KEY` | 若 22 端口不通 | GCP 服务账号 JSON |
| `GCP_PROJECT` | IAP 时必填 | 项目 ID |
| `GCP_ZONE` | IAP 时必填 | 如 `us-east1-b` |
| `GCP_INSTANCE` | IAP 时必填 | VM 实例名 |

在 Actions 页面手动触发 **Deploy All Apps**。

> GitHub Actions runner 目前连 `34.75.40.67:22` 会超时。需开放防火墙或配置 IAP：
>
> ```bash
> gcloud compute firewall-rules create allow-ssh-ingress-from-iap \
>   --direction=INGRESS --action=allow --rules=tcp:22 \
>   --source-ranges=35.235.240.0/20
> ```

## 验证

```bash
for d in orasage.com auth.orasage.com shop.orasage.com admin.orasage.com \
         bazi.orasage.com ziwei.orasage.com tarot.orasage.com; do
  echo -n "$d → "; curl -s -o /dev/null -w "%{http_code}\n" --max-time 10 "https://$d"
done
```

## 故障排查

```bash
# 查看服务状态
sudo systemctl status orasage-main orasage-auth orasage-shop orasage-admin \
  orasage-bazi orasage-ziwei orasage-tarot orasage-cms

# 查看日志
sudo journalctl -u orasage-admin -n 50 --no-pager
sudo journalctl -u orasage-bazi -n 50 --no-pager
```
