import type { CityLookupResult } from "../types";
import { getCityMessages } from "../i18n";
import { formatCityLabel } from "../i18n";

type Props = {
  result: CityLookupResult;
  locale: string;
  onRevise: () => void;
};

export function CityConfirmCard({ result, locale, onRevise }: Props) {
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
        <button type="button" className="orasage-city-change" onClick={onRevise}>
          {t.confirmNo}
        </button>
      </p>
      {lowConfidence ? (
        <p className="orasage-city-hint orasage-city-hint--warn">
          {t.verifyHint}
          {result.suggestion ? ` — ${result.suggestion}` : ` — ${t.parentHint}`}
        </p>
      ) : null}
    </div>
  );
}
