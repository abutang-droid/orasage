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
making_live=$(grep -A20 'MAKING_LIVE_SKUS' "$ROOT/shared/origins-making/index.ts" | grep -c "crystal-" || echo 0)
atelier_ready=0
our_story_ready=0
grep -q '选石' "$ROOT/main/src/app/[locale]/origins/atelier/page.tsx" 2>/dev/null && atelier_ready=1 || true
grep -q '知结构' "$ROOT/main/src/app/[locale]/origins/our-story/page.tsx" 2>/dev/null && our_story_ready=1 || true
making_finished=$((making_stories + atelier_ready + our_story_ready))

echo "=== Content baseline audit ==="
echo "Insights pillar hub pages: $pillar_pages (includes hub + 4 pillars + corrections)"
echo "Insights articles (registry): $articles (target >=24)"
echo "Insights article route template(s): $article_routes"
echo "The Making route files: $making_pages"
echo "The Making published crystal stories: $making_stories / 5"
echo "The Making live SKUs: $making_live"
echo "Atelier published: $atelier_ready"
echo "Our Story published: $our_story_ready"
echo "Origins finished pieces (5 SKUs + atelier + our-story): $making_finished / 7"
echo
if [ "$articles" -ge 24 ]; then
  echo "Insights article target: OK ($articles >= 24)"
else
  echo "Insights article target: GAP ($articles / 24)"
fi
if [ "$making_finished" -ge 7 ]; then
  echo "Making/Origins target: OK ($making_finished >= 7)"
else
  echo "Making/Origins target: GAP ($making_finished / 7)"
fi
