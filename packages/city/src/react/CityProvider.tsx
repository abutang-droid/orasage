import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { CityApiClient } from "../api";
import type { CityLocale } from "../i18n";

export type CityProviderProps = {
  api: CityApiClient;
  locale?: CityLocale | string;
  children: ReactNode;
};

type CityContextValue = {
  api: CityApiClient;
  locale: string;
};

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ api, locale = "zh-CN", children }: CityProviderProps) {
  return (
    <CityContext.Provider value={{ api, locale }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error("@orasage/city: useCityContext must be used within CityProvider");
  }
  return ctx;
}
