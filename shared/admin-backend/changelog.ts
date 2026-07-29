import changelogJson from './changelog.json';

export type AdminChangelogRulesImpact = {
  added: string[];
  changed: string[];
  removed: string[];
};

export type AdminChangelogEntry = {
  id: string;
  date: string;
  title: string;
  summary: string;
  modules: string[];
  phase?: string;
  rulesImpact: AdminChangelogRulesImpact;
  links: string[];
};

export type AdminChangelogFile = {
  version: number;
  entries: AdminChangelogEntry[];
};

const data = changelogJson as AdminChangelogFile;

export function getAdminChangelog(): AdminChangelogFile {
  return data;
}

export function listAdminChangelogEntries(): AdminChangelogEntry[] {
  return Array.isArray(data.entries) ? data.entries : [];
}
