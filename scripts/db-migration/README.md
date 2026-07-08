# MySQL → PostgreSQL 数据迁移

将 `bazi_calculator` 与 `tarot` 从 MariaDB/MySQL 迁入 PostgreSQL 16（与 `orasage_auth` / `orasage_cms` 同实例）。

## 前置条件

- PostgreSQL 16 已运行，`orasage` 用户已存在（与 auth-service 相同）。
- 应用代码已切换到 PostgreSQL（本 PR）。
- **cutover 前停止** `orasage-bazi` 与 `orasage-tarot`，避免双写。

## 1. 创建 PG 库

```bash
cd scripts/db-migration
npm install
bash create-pg-databases.sh
```

## 2. 应用 schema（空库）

**tarot**（在 `tarot/` 目录）：

```bash
cd tarot
DATABASE_URL=postgresql://orasage:PASS@127.0.0.1:5432/orasage_tarot npx prisma migrate deploy
```

**bazi**（在 `bazi/` 目录）：

```bash
cd bazi
DATABASE_URL=postgresql://orasage:PASS@127.0.0.1:5432/orasage_bazi npx drizzle-kit push --force
# 或: psql $DATABASE_URL -f drizzle/0000_init_postgresql.sql
```

## 3. 导入数据

```bash
cd scripts/db-migration
export MYSQL_BAZI_URL='mysql://orasage:PASS@127.0.0.1:3306/bazi_calculator'
export MYSQL_TAROT_URL='mysql://orasage:PASS@127.0.0.1:3306/tarot'
export PG_BAZI_URL='postgresql://orasage:PASS@127.0.0.1:5432/orasage_bazi'
export PG_TAROT_URL='postgresql://orasage:PASS@127.0.0.1:5432/orasage_tarot'
bash run-cutover.sh
```

## 4. 切换应用并重启

更新 VPS 上 `/opt/orasage/bazi/.env` 与 `/opt/orasage/tarot/.env` 的 `DATABASE_URL` 为 PG 连接串，然后：

```bash
sudo systemctl restart orasage-bazi orasage-tarot
```

## 5. 冒烟验收

- tarot：访客登录、每日一卡、三牌阵、oragate 桥接、功德
- bazi：Manus OAuth、orasage 桥接、排盘、购买、报告、历史

## 6. 下线 MySQL（验证通过后立即执行，不保留）

```bash
CONFIRM_DECOMMISSION=yes bash decommission-mysql.sh
```

## 回滚

若 cutover 后尚未 decommission：停服务 → 改回 MySQL `DATABASE_URL` → 重启。  
cutover 窗口内写入 PG 的新数据在回滚时会丢失，因此窗口应尽量短。
