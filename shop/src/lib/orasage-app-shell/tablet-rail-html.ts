import { pickLabel, SHELL_LABELS } from './labels';
import type { NavCategory } from './primary-nav';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Static-page navigation rail. CSS shows it on Android tablets and other short-side ≥600px windows. */
export function tabletRailHtml(options: {
  locale: string;
  brandHref: string;
  brandLabel: string;
  categories: NavCategory[];
  profileHref: string;
  profileLabel: string;
  readingsHref: string;
  readingsLabel: string;
}): string {
  const sections = options.categories
    .map((cat) => {
      const children = (cat.children ?? [])
        .map(
          (child) =>
            `<a href="${esc(child.href)}" class="orasage-tablet-rail-link">${esc(child.label)}</a>`,
        )
        .join('\n          ');
      return `<div class="orasage-tablet-rail-section">
          <a href="${esc(cat.href)}" class="orasage-tablet-rail-heading">${esc(cat.label)}</a>
          ${children}
        </div>`;
    })
    .join('\n        ');

  return `<nav class="orasage-tablet-rail" aria-label="${esc(pickLabel(SHELL_LABELS.menu, options.locale))}">
  <a href="${esc(options.brandHref)}" class="orasage-tablet-rail-brand">${esc(options.brandLabel)}</a>
  <div class="orasage-tablet-rail-scroll">
        ${sections}
  </div>
  <div class="orasage-tablet-rail-utilities">
    <a href="${esc(options.profileHref)}" class="orasage-tablet-rail-link">${esc(options.profileLabel)}</a>
    <a href="${esc(options.readingsHref)}" class="orasage-tablet-rail-link">${esc(options.readingsLabel)}</a>
  </div>
</nav>`;
}
