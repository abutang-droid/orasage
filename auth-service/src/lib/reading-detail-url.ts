const TAROT_ORIGIN = process.env.TAROT_PUBLIC_URL || "https://tarot.orasage.com";

type TarotPayload = {
  type?: string;
  recordId?: string;
};

/** 为用户中心占卜列表生成可点击的回跳详情 URL */
export function resolveReadingDetailUrl(
  appSource: string,
  payloadJson: string | null,
  reportUrl: string | null,
): string | null {
  if (reportUrl && appSource !== "ziwei") return reportUrl;

  if (appSource !== "tarot") return reportUrl;

  if (!payloadJson) return TAROT_ORIGIN;

  try {
    const payload = JSON.parse(payloadJson) as TarotPayload;
    if (payload.type === "three_card" && payload.recordId) {
      return `${TAROT_ORIGIN}/reading?readingId=${encodeURIComponent(payload.recordId)}`;
    }
    if (payload.type === "daily_fortune") {
      return `${TAROT_ORIGIN}/daily-fortune`;
    }
  } catch {
    /* ignore malformed payload */
  }

  return TAROT_ORIGIN;
}
