import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { BirthplaceValue, CityLookupResult, CityRecord } from "../types";
import { addCityToCatalog, loadCityCatalog } from "../catalog";
import { matchLocalCity, searchCities, toCityCoords } from "../search";
import { formatCityLabel, getCityMessages } from "../i18n";
import { useCityContext } from "./CityProvider";
import { CityConfirmCard } from "./CityConfirmCard";

export type CitySearchInputProps = {
  value: BirthplaceValue;
  onChange: (value: BirthplaceValue) => void;
  className?: string;
  fieldClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  id?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  required?: boolean;
};

export async function resolveCityCoords(
  cityName: string,
  catalog: CityRecord[],
): Promise<{ lng: number; lat: number; timezone: string } | null> {
  const local = matchLocalCity(catalog, cityName);
  if (local) {
    const coords = toCityCoords(local);
    return { lng: coords.lng, lat: coords.lat, timezone: coords.timezone };
  }
  return null;
}

export function CitySearchInput({
  value,
  onChange,
  className,
  fieldClassName,
  dropdownClassName,
  optionClassName,
  id,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  required,
}: CitySearchInputProps) {
  const { api, locale } = useCityContext();
  const t = getCityMessages(locale);
  const reactId = useId();
  const listboxId = `${reactId}-listbox`;
  const inputId = id ?? `${reactId}-city-input`;

  const [catalog, setCatalog] = useState<CityRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<CityRecord[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dataError, setDataError] = useState<string | null>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [pending, setPending] = useState<CityLookupResult | null>(null);
  const [pendingQuery, setPendingQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCityCatalog()
      .then((cities) => {
        if (!cancelled) {
          setCatalog(cities);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setDataError(t.loadFailed);
      });
    return () => {
      cancelled = true;
    };
  }, [t.loadFailed]);

  useEffect(() => {
    const label = value.city ? formatCityLabel(value.city, value.country) : "";
    setQuery(label);
  }, [value.city, value.country]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyCity = useCallback(
    (record: CityRecord) => {
      onChange({
        city: record.city,
        country: record.country,
        lng: record.lng,
        lat: record.lat,
        timezone: record.timezone,
      });
      setPending(null);
      setDataError(null);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange],
  );

  const triggerAiLookup = useCallback(
    (q: string) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (q.length < 2) return;

      searchTimeoutRef.current = setTimeout(async () => {
        setAiSearching(true);
        setDataError(null);
        setPending(null);
        try {
          const result = await api.lookupCity(q);
          if ("found" in result && result.found === false) {
            setDataError(result.suggestion || t.notFound);
            return;
          }
          setPendingQuery(q);
          setPending(result as CityLookupResult);
        } catch {
          setDataError(t.notFound);
        } finally {
          setAiSearching(false);
        }
      }, 800);
    },
    [api, t.notFound],
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setPending(null);
    setActiveIndex(-1);

    // 输入与已选标签不一致时取消过期选择（保留坐标契约不串位）
    if (value.city) {
      const selectedLabel = formatCityLabel(value.city, value.country);
      if (q !== selectedLabel) {
        onChange({ city: "", country: "" });
      }
    }

    if (q.length >= 1) {
      const results = searchCities(catalog, q, 8);
      setSuggestions(results);
      setOpen(results.length > 0);

      if (results.length > 0) {
        setDataError(null);
      } else if (!ready) {
        setDataError(null);
      } else {
        setDataError(null);
        triggerAiLookup(q);
      }
    } else {
      setSuggestions([]);
      setOpen(false);
      setDataError(null);
      onChange({ city: "", country: "" });
    }
  };

  const handleSelect = (city: CityRecord) => {
    setQuery(formatCityLabel(city.city, city.country));
    applyCity(city);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      if (!open && suggestions.length > 0) {
        setOpen(true);
        setActiveIndex(0);
        e.preventDefault();
        return;
      }
      if (open && suggestions.length > 0) {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      if (open && suggestions.length > 0) {
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      }
      return;
    }
    if (e.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]!);
      }
      return;
    }
    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      const saved = await api.confirmCity({
        query: pendingQuery,
        city: pending.city,
        province: pending.province,
        country: pending.country,
        lng: pending.lng,
        lat: pending.lat,
        timezone: pending.timezone,
        alias: pendingQuery !== pending.city ? [pendingQuery] : undefined,
      });
      addCityToCatalog(saved);
      setCatalog((prev) => [...prev.filter((c) => c.city !== saved.city || c.province !== saved.province), saved]);
      setQuery(formatCityLabel(saved.city, saved.country));
      applyCity(saved);
    } catch {
      applyCity({
        city: pending.city,
        province: pending.province,
        country: pending.country,
        lng: pending.lng,
        lat: pending.lat,
        timezone: pending.timezone,
      });
    }
  };

  const handleReject = () => {
    setPending(null);
    setQuery("");
    onChange({ city: "", country: "" });
  };

  const fieldClass = `${fieldClassName || "orasage-city-field"}${focused ? " is-focused" : ""}`;
  const dropdownClass = dropdownClassName || "orasage-city-dropdown";
  const optionClass = optionClassName || "orasage-city-option";
  const listOpen = open && suggestions.length > 0;
  const activeOptionId =
    listOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div className={className ?? "relative"} ref={containerRef}>
      <div className={fieldClass}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground shrink-0"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={listOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={required || undefined}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            if (query.length >= 1 && suggestions.length > 0) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder={t.placeholder}
          autoComplete="off"
        />
        {aiSearching ? (
          <span className="text-xs text-primary/70 shrink-0" role="status">
            {t.aiMatching}
          </span>
        ) : null}
        {query ? (
          <button
            type="button"
            onClick={handleReject}
            className="orasage-city-clear"
            aria-label={t.clear}
          >
            <span aria-hidden>×</span>
          </button>
        ) : null}
      </div>

      {dataError ? <p className="orasage-city-error">{dataError}</p> : null}

      {value.lng !== undefined ? (
        <div className="orasage-city-meta">
          {value.lng > 0
            ? `${t.longitudeEast}${value.lng.toFixed(1)}°`
            : `${t.longitudeWest}${Math.abs(value.lng).toFixed(1)}°`}
          {" · "}
          {t.timezone} UTC{value.timezone || "+8"}
        </div>
      ) : null}

      <div
        id={listboxId}
        role="listbox"
        hidden={!listOpen}
        className={listOpen ? dropdownClass : undefined}
      >
        {listOpen
          ? suggestions.map((city, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={`${city.city}-${city.province}-${city.country}`}
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(city);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`${optionClass}${selected ? " is-active" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{city.city}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--os-color-mono-gray-deep, #6b7280)" }}>
                      {city.country && city.country !== "中国" ? city.country : city.province || ""}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "var(--os-color-mono-gray-deep, #6b7280)", marginTop: "0.125rem" }}>
                    {city.lng > 0
                      ? `${t.longitudeEast} ${city.lng.toFixed(2)}°`
                      : `${t.longitudeWest} ${Math.abs(city.lng).toFixed(2)}°`}
                    {city.timezone ? ` · UTC${city.timezone}` : null}
                  </div>
                </button>
              );
            })
          : null}
      </div>

      {pending ? (
        <CityConfirmCard
          result={pending}
          locale={locale}
          onConfirm={() => void handleConfirm()}
          onReject={handleReject}
        />
      ) : null}
    </div>
  );
}
