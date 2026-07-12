export type ThreeCardTrilogyPayload = {
  mode: string;
  nodes: Array<{ position: string; cardName: string; mapping: string }>;
  chainAnalysis: string;
  actionThreshold: string;
  llm: boolean;
};

/** @deprecated 旧版详读 */
export type ThreeCardLegacyFullReport = {
  cards: Array<{ interpretation: string; mantra: string }>;
  synthesis: string;
  suggestions: string[];
  affirmation: string;
  llm: boolean;
};

export type ThreeCardFullReport = ThreeCardTrilogyPayload | ThreeCardLegacyFullReport;

export function isThreeCardTrilogy(
  report: ThreeCardFullReport | null | undefined,
): report is ThreeCardTrilogyPayload {
  return report != null && 'chainAnalysis' in report && Array.isArray(report.nodes);
}
