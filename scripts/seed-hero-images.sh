#!/usr/bin/env bash
# Seed portal + ziwei CMS hero images from shared/brand/heroes/*.jpg
# Usage (on host with CMS media dir + Postgres):
#   CMS_MEDIA_DIR=/var/lib/orasage/cms-media DATABASE_URL=postgresql://.../orasage_cms \
#     bash scripts/seed-hero-images.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MEDIA_DIR="${CMS_MEDIA_DIR:-/var/lib/orasage/cms-media}"
DB="${DATABASE_URL:-postgresql://orasage@127.0.0.1:5432/orasage_cms}"

mkdir -p "$MEDIA_DIR"
cp -f "$ROOT/shared/brand/heroes/main.jpg" "$MEDIA_DIR/main.jpg"
cp -f "$ROOT/shared/brand/heroes/ziwei.jpg" "$MEDIA_DIR/ziwei.jpg"

main_size=$(wc -c < "$MEDIA_DIR/main.jpg" | tr -d ' ')
ziwei_size=$(wc -c < "$MEDIA_DIR/ziwei.jpg" | tr -d ' ')

psql "$DB" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO media (alt, url, filename, mime_type, filesize, width, height, focal_x, focal_y, created_at, updated_at)
SELECT '门户首页 Hero', '/cms/api/media/file/main.jpg', 'main.jpg', 'image/jpeg', ${main_size}, 1392, 752, 50, 50, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM media WHERE filename = 'main.jpg');

INSERT INTO media (alt, url, filename, mime_type, filesize, width, height, focal_x, focal_y, created_at, updated_at)
SELECT '紫微首页 Hero', '/cms/api/media/file/ziwei.jpg', 'ziwei.jpg', 'image/jpeg', ${ziwei_size}, 1392, 752, 50, 50, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM media WHERE filename = 'ziwei.jpg');

UPDATE media SET filesize=${main_size}, width=1392, height=752, url='/cms/api/media/file/main.jpg', mime_type='image/jpeg', updated_at=now()
WHERE filename='main.jpg';
UPDATE media SET filesize=${ziwei_size}, width=1392, height=752, url='/cms/api/media/file/ziwei.jpg', mime_type='image/jpeg', updated_at=now()
WHERE filename='ziwei.jpg';

UPDATE home_hero SET
  display_mode = 'image',
  hero_image_id = (SELECT id FROM media WHERE filename = 'main.jpg'),
  eyebrow = COALESCE(NULLIF(eyebrow, ''), 'OraSage'),
  headline = COALESCE(NULLIF(headline, ''), '探索命运，平衡能量'),
  subtitle = COALESCE(subtitle, '八字 · 紫微 · 塔罗 — 东方智慧与现代科技的融合'),
  updated_at = now()
WHERE id = 1;

UPDATE ziwei_home_hero SET
  display_mode = 'image',
  hero_image_id = (SELECT id FROM media WHERE filename = 'ziwei.jpg'),
  eyebrow = COALESCE(NULLIF(eyebrow, ''), '紫微斗数'),
  headline = COALESCE(NULLIF(headline, ''), '紫微排盘，洞察命盘十二宫'),
  subtitle = COALESCE(subtitle, '输入出生信息，即刻生成紫微命盘与 AI 解读'),
  updated_at = now()
WHERE id = 1;
SQL

echo "Seeded main.jpg + ziwei.jpg into $MEDIA_DIR and linked CMS home/ziwei heroes."
