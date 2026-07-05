import type { CityLookupResult } from "../types.ts";
import { getCityMessages } from "../i18n.ts";
import { formatCityLabel } from "../i18n.ts";

type Props = {
  result: CityLookupResult;
  locale: string;
  onConfirm: () => void;
  onReject: () => void;
};

export function CityConfirmCard({ result, locale, onConfirm, onReject }: Props) {
  const t = getCityMessages(locale);
  const lowConfidence = result.confidence < 0.85;
  const region = result.country === "中国" ? result.province : result.country;
  const label = formatCityLabel(result.city, result.country);

  return (
    <div className="orasage-city-confirm">
      <p className="orasage-city-hint">
        {t.confirmTitle}
        <strong>
          {label}
          {region ? `（${region}）` : ""}
        </strong>
      </p>
      {lowConfidence ? (
        <p className="orasage-city-hint orasage-city-hint--warn">
          {t.verifyHint}
          {result.suggestion ? ` — ${result.suggestion}` : ` — ${t.parentHint}`}
        </p>
      ) : null}
      <div className="orasage-city-confirm-actions">
        <button type="button" className="orasage-city-btn orasage-city-btn--primary" onClick={onConfirm}>
          {t.confirmYes}
        </button>
        <button type="button" className="orasage-city-btn" onClick={onReject}>
          {t.confirmNo}
        </button>
      </div>
    </div>
  );
}
