#!/usr/bin/env bash
# Content baseline audit (doc 25/26 P0 Step 5). Counts publishable shells vs targets.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

pillar_pages=$(find "$ROOT/main/src/app/[locale]/insights" -maxdepth 2 -name 'page.tsx' 2>/dev/null | wc -l | tr -d ' ')
article_routes=$(find "$ROOT/main/src/app/[locale]/insights" -path '*/\[pillar\]/\[slug\]/page.tsx' 2>/dev/null | wc -l | tr -d ' ')
articles=$(grep -c "pillar:" "$ROOT/main/src/lib/insights-articles/day-master.ts" 2>/dev/null || echo 0)
articles=$((articles + $(grep -c "pillar:" "$ROOT/main/src/lib/insights-articles/five-elements.ts" 2>/dev/null || echo 0)))
articles=$((articles + $(grep -c "pillar:" "$ROOT/main/src/lib/insights-articles/crystal.ts" 2>/dev/null || echo 0)))
articles=$((articles + $(grep -c "pillar:" "$ROOT/main/src/lib/insights-articles/solar-terms.ts" 2>/dev/null || echo 0)))
making_pages=$(find "$ROOT/main/src/app/[locale]/origins/the-making" -name 'page.tsx' 2>/dev/null | wc -l | tr -d ' ')

echo "=== Content baseline audit ==="
echo "Insights pillar hub pages: $pillar_pages (includes hub + 4 pillars + corrections)"
echo "Insights articles (registry): $articles (target ≥24)"
echo "Insights article route template(s): $article_routes"
echo "The Making route files: $making_pages (target 7 finished stories; 5 crystal SKUs + atelier + our-story)"
echo
if [ "$articles" -ge 24 ]; then
  echo "Insights article target: OK ($articles ≥ 24)"
else
  echo "Insights article target: GAP ($articles / 24)"
fi
echo "Next: publish remaining Making SKU narratives beyond crystal-wood."
