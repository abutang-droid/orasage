# tarot 塔罗应用部署说明

## ⚠️ 前置条件

塔罗现有线上服务的真实上游地址（类似 bazi 的 `api1.lilyfunnlove.com`、
ziwei 的 `api2.lilyfunnlove.com`）尚未在本仓库任何文档中确认。**部署前必须先
向现有运营方确认真实地址**，并设置 `TAROT_UPSTREAM_URL`，否则反代服务会拒绝
启动（`proxy/server.js` 会在缺少该变量时直接退出，避免误代理到错误目标）。

## 快速部署

```bash
# 本地（需 VPS SSH 密钥）
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=proxy TAROT_UPSTREAM_URL=https://<真实地址> \
  bash deploy/remote-deploy-tarot.sh
```

## GitHub Actions 配置

在仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 必填 | 说明 |
|--------|------|------|
| `SSH_PRIVATE_KEY` | 是 | VPS 私钥，完整 PEM |
| `TAROT_UPSTREAM_URL` | 是 | 塔罗现有线上服务真实地址 |
| `SSH_USER` / `SSH_HOST` | 否 | 默认 `ubuntu` / `34.75.40.67` |

排障步骤与 bazi 一致，详见 [`deploy/bazi/README.md`](../bazi/README.md#常见问题)。

## 部署模式

| 模式 | 说明 |
|------|------|
| `proxy` | 迁移阶段，3112 代理到 `TAROT_UPSTREAM_URL` |
| `native` | 自托管，需设置 `TAROT_REPO_URL` 指向真实的塔罗应用源码仓库；该仓库当前尚未创建/提供，**在拿到源码地址前请勿使用 native 模式** |

## 验证

```bash
curl -s https://tarot.orasage.com/health
```
