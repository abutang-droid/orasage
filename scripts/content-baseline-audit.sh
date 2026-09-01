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
making_stories=$(grep -cE "^  'crystal-" "$ROOT/shared/origins-making/stories.ts" 2>/dev/null || echo 0)
making_live=$(grep -A10 'MAKING_LIVE_SKUS' "$ROOT/shared/origins-making/index.ts" | grep -c "crystal-" || echo 0)

echo "=== Content baseline audit ==="
echo "Insights pillar hub pages: $pillar_pages (includes hub + 4 pillars + corrections)"
echo "Insights articles (registry): $articles (target >=24)"
echo "Insights article route template(s): $article_routes"
echo "The Making route files: $making_pages (target 7 finished stories; 5 crystal SKUs + atelier + our-story)"
echo "The Making published stories: $making_stories (narratives in stories.ts)"
echo "The Making live SKUs: $making_live"
echo
if [ "$articles" -ge 24 ]; then
  echo "Insights article target: OK ($articles >= 24)"
else
  echo "Insights article target: GAP ($articles / 24)"
fi
if [ "$making_stories" -ge 3 ]; then
  echo "Making stories (wood/fire/earth batch): OK ($making_stories >= 3)"
else
  echo "Making stories: GAP ($making_stories / 3 for current batch)"
fi
echo "Next: finish crystal-metal, crystal-water, atelier, our-story (target 7)."
