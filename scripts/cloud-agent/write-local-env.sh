#!/usr/bin/env bash
# Write gitignored local .env files when missing. Idempotent.
set -euo pipefail
# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

write_if_missing "$ROOT/auth-service/.env" "\
PORT=3101
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL=${AUTH_DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=30d
CORS_ORIGINS=http://127.0.0.1:3100,http://127.0.0.1:3102,http://127.0.0.1:3103,http://127.0.0.1:3110,http://127.0.0.1:3111,http://127.0.0.1:3112,http://localhost:3100,http://localhost:3102,http://localhost:3103,http://localhost:3110,http://localhost:3111,http://localhost:3112
"

write_if_missing "$ROOT/main/.env.local" "\
NEXT_PUBLIC_AUTH_URL=http://127.0.0.1:3101
AUTH_INTERNAL_URL=http://127.0.0.1:3101
JWT_SECRET=${JWT_SECRET}
JWT_COOKIE_NAME=orasage_token
SHOP_URL=http://127.0.0.1:3102
CMS_INTERNAL_URL=http://127.0.0.1:3120
TAROT_INTERNAL_URL=http://127.0.0.1:3112
"

write_if_missing "$ROOT/shop/.env" "\
NODE_ENV=development
PORT=3102
HOSTNAME=0.0.0.0
JWT_SECRET=${JWT_SECRET}
JWT_COOKIE_NAME=orasage_token
AUTH_URL=http://127.0.0.1:3101
AUTH_INTERNAL_URL=http://127.0.0.1:3101
SHOP_URL=http://127.0.0.1:3102
PAYMENT_MODE=mock
TAROT_INTERNAL_URL=http://127.0.0.1:3112
"

write_if_missing "$ROOT/admin/.env.local" "\
JWT_SECRET=${JWT_SECRET}
AUTH_URL=http://127.0.0.1:3101
AUTH_INTERNAL_URL=http://127.0.0.1:3101
"

write_if_missing "$ROOT/cms/.env" "\
NODE_ENV=development
PORT=3120
DATABASE_URL=${CMS_DATABASE_URL}
PAYLOAD_SECRET=${PAYLOAD_SECRET}
JWT_SECRET=${JWT_SECRET}
JWT_COOKIE_NAME=orasage_token
NEXT_PUBLIC_AUTH_URL=http://127.0.0.1:3101
NEXT_PUBLIC_ADMIN_URL=http://127.0.0.1:3103
CMS_BASE_PATH=
NEXT_PUBLIC_SERVER_URL=http://127.0.0.1:3120
CMS_MEDIA_DIR=/tmp/orasage-cms-media
"

write_if_missing "$ROOT/bazi/.env" "\
DATABASE_URL=${BAZI_DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
PORT=3110
NODE_ENV=development
"

write_if_missing "$ROOT/ziwei/.env.local" "\
PORT=3111
JWT_SECRET=${JWT_SECRET}
AUTH_URL=http://127.0.0.1:3101
AUTH_INTERNAL_URL=http://127.0.0.1:3101
PARENT_AUTH_COOKIE_NAME=orasage_token
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3111
CMS_INTERNAL_URL=http://127.0.0.1:3120
"

write_if_missing "$ROOT/tarot/.env" "\
DATABASE_URL=${TAROT_DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
PORT=3112
"
