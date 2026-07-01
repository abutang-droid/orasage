# cms 部署说明（Payload CMS）

当前为最小可用骨架：Users / Media / Pages 三个 Collection，已本地验证
`npm install` → `npm run migrate` → `npm run build` → `npm start` 全链路可用
（管理面板 `/admin` 与 REST API `/api/pages` 均正常响应）。

## VPS 部署步骤

```bash
cd /opt/orasage/cms
cp .env.example .env   # 修改 DATABASE_URL / PAYLOAD_SECRET

npm install
npm run migrate   # 首次部署创建表结构；以后有新迁移文件时同样执行
npm run build

sudo cp /opt/orasage/deploy/cms/orasage-cms.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now orasage-cms

curl -s http://127.0.0.1:3120/api/pages
```

## 首次使用

首次访问 `https://cms.orasage.com/admin` 会提示创建第一个管理员账号
（邮箱 + 密码），创建后即可管理 Pages / Media 内容，通过 REST API
（`/api/pages`）或 GraphQL（`/api/graphql`）供 main / 命理 App 读取内容。

## 后续迭代方向

- 按需拆分 Pages 为更细的 Collection（Articles / Announcements / FAQ）
- 接入统一 JWT（目前使用 Payload 自带的 Users 认证，与 auth.orasage.com 独立）
- 配置对象存储（S3 兼容）承载 Media，而非本机磁盘
