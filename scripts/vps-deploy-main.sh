#!/usr/bin/env bash
# One-shot production deploy. Run on VPS via GCP Console SSH (port 22 blocked publicly).
set -euo pipefail
cd /opt/orasage
git fetch origin main
git checkout main
git reset --hard origin/main
sudo ORASAGE_REF=main FORTUNE_MODE=native SKIP_CMS=0 DEPLOY_DIR=/opt/orasage \
  bash deploy/bootstrap-all-on-vps.sh
bash scripts/cms/p0-rewrite-pdp-guides.sh || true
sudo nginx -t && sudo systemctl reload nginx
bash scripts/verify-p0.sh
echo "Deploy complete."
