#!/usr/bin/env bash
# OraSage 本地完整环境一键初始化（数据库 + .env + 依赖 + schema）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

JWT_SECRET="${JWT_SECRET:-orasage-local-dev-secret-key-32chars!}"
PAYLOAD_SECRET="${PAYLOAD_SECRET:-orasage-local-payload-secret-32chars!!}"
PG_USER="${PG_USER:-orasage}"
PG_PASS="${PG_PASS:-orasage_local_dev}"
MYSQL_USER="${MYSQL_USER:-orasage}"
MYSQL_PASS="${MYSQL_PASS:-orasage_local_dev}"

PG_AUTH_URL="postgresql://${PG_USER}:${PG_PASS}@127.0.0.1:5432/orasage_auth"
PG_CMS_URL="postgresql://${PG_USER}:${PG_PASS}@127.0.0.1:5432/orasage_cms"
MYSQL_BAZI_URL="mysql://${MYSQL_USER}:${MYSQL_PASS}@127.0.0.1:3306/bazi_calculator"
MYSQL_TAROT_URL="mysql://${MYSQL_USER}:${MYSQL_PASS}@127.0.0.1:3306/tarot"

LOCALHOST_CORS="http://localhost:3100,http://localhost:3101,http://localhost:3102,http://localhost:3103,http://localhost:3110,http://localhost:3111,http://localhost:3112,http://localhost:3120,http://127.0.0.1:3100,http://127.0.0.1:3101,http://127.0.0.1:3102,http://127.0.0.1:3103,http://127.0.0.1:3110,http://127.0.0.1:3111,http://127.0.0.1:3112,http://127.0.0.1:3120"

echo "==> [1/6] 启动 PostgreSQL / MariaDB"
if command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo pg_ctlcluster 16 main start 2>/dev/null || sudo service postgresql start 2>/dev/null || true
fi
sudo service mariadb start 2>/dev/null || true

echo "==> [2/6] 创建数据库与用户"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${PG_USER}') THEN
    CREATE USER ${PG_USER} WITH PASSWORD '${PG_PASS}';
  END IF;
END \$\$;
SELECT 'CREATE DATABASE orasage_auth OWNER ${PG_USER}' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'orasage_auth')\gexec
SELECT 'CREATE DATABASE orasage_cms OWNER ${PG_USER}' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'orasage_cms')\gexec
GRANT ALL PRIVILEGES ON DATABASE orasage_auth TO ${PG_USER};
GRANT ALL PRIVILEGES ON DATABASE orasage_cms TO ${PG_USER};
SQL

sudo mariadb <<SQL
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASS}';
CREATE DATABASE IF NOT EXISTS bazi_calculator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS tarot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON bazi_calculator.* TO '${MYSQL_USER}'@'localhost';
GRANT ALL PRIVILEGES ON tarot.* TO '${MYSQL_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "==> [3/6] 写入各 App .env"
cat > "$ROOT/auth-service/.env" <<EOF
NODE_ENV=development
PORT=3101
HOST=127.0.0.1
DATABASE_URL=${PG_AUTH_URL}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=30d
CORS_ORIGINS=${LOCALHOST_CORS}
COOKIE_DOMAIN=localhost
EOF

cat > "$ROOT/shop/.env" <<EOF
NODE_ENV=development
PORT=3102
HOSTNAME=127.0.0.1
JWT_SECRET=${JWT_SECRET}
JWT_COOKIE_NAME=orasage_token
AUTH_URL=http://localhost:3101
AUTH_INTERNAL_URL=http://127.0.0.1:3101
SHOP_URL=http://localhost:3102
PAYMENT_MODE=mock
TAROT_INTERNAL_URL=http://127.0.0.1:3112
TAROT_INTERNAL_SECRET=${JWT_SECRET}
BAZI_INTERNAL_URL=http://127.0.0.1:3110
ZIWEI_INTERNAL_URL=http://127.0.0.1:3111
EOF

cat > "$ROOT/main/.env.local" <<EOF
NEXT_PUBLIC_AUTH_URL=http://localhost:3101
AUTH_URL=http://localhost:3101
SHOP_URL=http://localhost:3102
CMS_URL=http://localhost:3120
NEXT_PUBLIC_CMS_URL=http://localhost:3120
EOF

cat > "$ROOT/admin/.env.local" <<EOF
NODE_ENV=development
JWT_SECRET=${JWT_SECRET}
JWT_COOKIE_NAME=orasage_token
AUTH_URL=http://localhost:3101
ADMIN_URL=http://localhost:3103
EOF

cat > "$ROOT/cms/.env" <<EOF
NODE_ENV=development
PORT=3120
DATABASE_URL=${PG_CMS_URL}
PAYLOAD_SECRET=${PAYLOAD_SECRET}
NEXT_PUBLIC_SERVER_URL=http://localhost:3120
EOF

cat > "$ROOT/bazi/.env" <<EOF
NODE_ENV=development
PORT=3110
DATABASE_URL=${MYSQL_BAZI_URL}
JWT_SECRET=${JWT_SECRET}
PARENT_AUTH_COOKIE_NAME=orasage_token
VITE_AUTH_URL=http://localhost:3101
EOF

cat > "$ROOT/ziwei/.env.local" <<EOF
NODE_ENV=development
PORT=3111
NEXT_PUBLIC_SITE_URL=http://localhost:3111
JWT_SECRET=${JWT_SECRET}
AUTH_URL=http://localhost:3101
AUTH_INTERNAL_URL=http://127.0.0.1:3101
PARENT_AUTH_COOKIE_NAME=orasage_token
BAZI_INTERNAL_URL=http://127.0.0.1:3110
ZIWEI_INTERNAL_URL=http://127.0.0.1:3111
EOF

cat > "$ROOT/tarot/.env" <<EOF
NODE_ENV=development
PORT=3112
DATABASE_URL="${MYSQL_TAROT_URL}"
JWT_SECRET=${JWT_SECRET}
AUTH_URL=http://localhost:3101
PARENT_AUTH_COOKIE_NAME=orasage_token
NEXT_PUBLIC_APP_URL=http://localhost:3112
CMS_URL=http://localhost:3120
NEXT_PUBLIC_CMS_URL=http://localhost:3120
TAROT_INTERNAL_SECRET=${JWT_SECRET}
EOF

echo "==> [4/6] 安装依赖"
(cd "$ROOT/auth-service" && npm install)
(cd "$ROOT/shop" && npm install)
(cd "$ROOT/main" && npm install)
(cd "$ROOT/admin" && npm install)
(cd "$ROOT/cms" && npm install)
(cd "$ROOT/ziwei" && npm install)
(cd "$ROOT/tarot" && npm install)
corepack enable 2>/dev/null || true
(cd "$ROOT/bazi" && pnpm install)

echo "==> [5/6] 推送数据库 schema"
(cd "$ROOT/auth-service" && npx drizzle-kit push --force)
for f in "$ROOT/auth-service/drizzle/"*.sql; do
  [ -f "$f" ] || continue
  echo "  apply $(basename "$f")"
  PGPASSWORD="$PG_PASS" psql "$PG_AUTH_URL" -f "$f" 2>/dev/null || true
done
(cd "$ROOT/cms" && npm run migrate)
(cd "$ROOT/cms" && npm run seed:tarot 2>/dev/null || true)
(cd "$ROOT/bazi" && DATABASE_URL="$MYSQL_BAZI_URL" npx drizzle-kit push --force)
(cd "$ROOT/tarot" && DATABASE_URL="$MYSQL_TAROT_URL" npx prisma db push)

echo "==> [6/6] 完成"
echo ""
echo "下一步: bash scripts/local-dev/start.sh"
echo "健康检查: bash scripts/local-dev/smoke.sh"
