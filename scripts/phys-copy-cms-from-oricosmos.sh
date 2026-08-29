#!/usr/bin/env bash
# 从 OriCosmos（或任意源机）物理复制 CMS 库 + 媒体到本机，并落到 shop/public/cms-media。
# 不经 HTTP 反代「显示」远端内容——文件与 Postgres 数据必须在本机落盘。
set -euo pipefail

SRC_HOST="${SRC_HOST:-je@34.130.99.36}"
SRC_SSH_OPTS="${SRC_SSH_OPTS:--o BatchMode=yes -o StrictHostKeyChecking=accept-new}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
CMS_ENV="${CMS_ENV:-$DEPLOY_DIR/cms/.env}"
MEDIA_DIR="${MEDIA_DIR:-/var/lib/orasage/cms-media}"
SHOP_PUBLIC_MEDIA="${SHOP_PUBLIC_MEDIA:-$DEPLOY_DIR/shop/public/cms-media}"
MAIN_PUBLIC_MEDIA="${MAIN_PUBLIC_MEDIA:-$DEPLOY_DIR/main/public/cms-media}"

log() { echo "[phys-cms-copy] $*"; }

need() { command -v "$1" >/dev/null || { log "missing $1"; exit 1; }; }
need psql; need pg_dump; need pg_restore; need tar; need scp

URL=$(grep -E '^DATABASE_URL=' "$CMS_ENV" | head -1 | sed 's/^DATABASE_URL=//' | tr -d '"' | tr -d "'")
[ -n "$URL" ] || { log "no DATABASE_URL in $CMS_ENV"; exit 1; }

STAMP=$(date +%Y%m%d%H%M)
WORKDIR=$(mktemp -d /tmp/phys-cms-XXXXXX)
trap 'rm -rf "$WORKDIR"' EXIT

log "dump source CMS on $SRC_HOST"
ssh $SRC_SSH_OPTS "$SRC_HOST" "bash -s" <<REMOTE
set -euo pipefail
SRC_URL=\$(grep -E '^DATABASE_URL=' /opt/orasage/cms/.env | head -1 | sed 's/^DATABASE_URL=//' | tr -d '"' | tr -d "'")
[ -n "\$SRC_URL" ] || SRC_URL=\$(grep -E '^DATABASE_URL=' /opt/orasage/.env | head -1 | sed 's/^DATABASE_URL=//' | tr -d '"' | tr -d "'")
pg_dump -Fc --no-owner --no-acl -d "\$SRC_URL" -f /tmp/phys_orasage_cms.dump
tar -C /var/lib/orasage -cf /tmp/phys_cms_media.tar cms-media
ls -lh /tmp/phys_orasage_cms.dump /tmp/phys_cms_media.tar
REMOTE

scp $SRC_SSH_OPTS "$SRC_HOST:/tmp/phys_orasage_cms.dump" "$SRC_HOST:/tmp/phys_cms_media.tar" "$WORKDIR/"

log "backup local CMS → /root/orasage_cms_pre_phys_${STAMP}.dump"
pg_dump -Fc --no-owner --no-acl -d "$URL" -f "/root/orasage_cms_pre_phys_${STAMP}.dump"

log "restore CMS database"
systemctl stop orasage-cms || true
pg_restore --clean --if-exists --no-owner --no-acl -d "$URL" "$WORKDIR/phys_orasage_cms.dump"

log "replace $MEDIA_DIR"
rm -rf "$MEDIA_DIR"
tar -C "$(dirname "$MEDIA_DIR")" -xf "$WORKDIR/phys_cms_media.tar"
chown -R ubuntu:ubuntu "$MEDIA_DIR" 2>/dev/null || true

log "copy into shop/main public (static)"
for dest in "$SHOP_PUBLIC_MEDIA" "$MAIN_PUBLIC_MEDIA"; do
  rm -rf "$dest"
  mkdir -p "$dest"
  cp -a "$MEDIA_DIR"/. "$dest/"
  chown -R ubuntu:ubuntu "$dest" 2>/dev/null || true
done

log "write sku-map.json"
MAP_TSV="$SHOP_PUBLIC_MEDIA/sku-map.tsv"
psql "$URL" -At -F $'\t' -c "
SELECT i.sku, m.filename
FROM shop_product_images i
JOIN media m ON m.id = i.image_id
ORDER BY i.sku;
" > "$MAP_TSV"
python3 - "$MAP_TSV" "$SHOP_PUBLIC_MEDIA/sku-map.json" <<'PY'
import json, sys
src, dst = sys.argv[1], sys.argv[2]
m = {}
for line in open(src, encoding="utf-8"):
    line = line.strip()
    if not line:
        continue
    sku, fn = line.split("\t", 1)
    m[sku] = fn
    m[f"{sku}-gift"] = fn
open(dst, "w", encoding="utf-8").write(json.dumps(m, ensure_ascii=False, indent=2) + "\n")
print("skus", len(m))
PY
chown ubuntu:ubuntu "$SHOP_PUBLIC_MEDIA/sku-map.json" "$MAP_TSV" 2>/dev/null || true

systemctl start orasage-cms || true
log "done. media_files=$(find "$MEDIA_DIR" -type f | wc -l) shop_public=$(find "$SHOP_PUBLIC_MEDIA" -type f | wc -l)"
log "Rebuild shop after deploy so /cms-media is included if needed: cd shop && npm run build && systemctl restart orasage-shop"
