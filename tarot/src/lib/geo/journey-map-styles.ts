export const REGION_COLORS: Record<string, string> = {
  asia: 'rgba(201, 149, 74, 0.5)',
  europe: 'rgba(139, 168, 136, 0.5)',
  africa: 'rgba(180, 140, 90, 0.5)',
  americas: 'rgba(120, 150, 190, 0.5)',
  oceania: 'rgba(100, 170, 160, 0.5)',
};

const COUNTRY_ACTIVE = 'rgba(201, 149, 74, 0.62)';
const COUNTRY_MUTED = 'rgba(222, 226, 232, 0.42)';
const COUNTRY_DEFAULT = 'rgba(222, 226, 232, 0.55)';

export const JVM_REGION_STYLE = {
  initial: {
    fill: COUNTRY_DEFAULT,
    fillOpacity: 1,
    stroke: 'rgba(255, 255, 255, 0.65)',
    strokeWidth: 0.4,
  },
  hover: {
    fillOpacity: 0.85,
    cursor: 'pointer',
  },
  selected: {
    fill: COUNTRY_ACTIVE,
    fillOpacity: 0.95,
  },
  selectedHover: {
    fillOpacity: 1,
  },
};

export const JVM_MARKER_STYLE = {
  initial: {
    r: 8,
    fill: '#c9954a',
    fillOpacity: 1,
    stroke: '#fff8ef',
    strokeWidth: 3,
    strokeOpacity: 0.9,
  },
  hover: {
    fill: '#b8843f',
    cursor: 'pointer',
  },
  selected: {
    fill: '#9a6f32',
    strokeWidth: 4,
  },
  selectedHover: {},
};

type CountryRef = { code: string; regionCode: string };

export function buildRegionStepSeries(countries: CountryRef[]) {
  const values: Record<string, string> = {};
  for (const country of countries) {
    values[country.code] = country.regionCode;
  }
  return {
    attribute: 'fill',
    scale: REGION_COLORS,
    values,
  };
}

export function buildCountryStepSeries(countries: CountryRef[], continentCode: string) {
  const values: Record<string, string> = {};
  for (const country of countries) {
    values[country.code] = country.regionCode === continentCode ? 'active' : 'muted';
  }
  return {
    attribute: 'fill',
    scale: {
      active: COUNTRY_ACTIVE,
      muted: COUNTRY_MUTED,
    },
    values,
  };
}

export function buildFaithStepSeries(countryCode: string) {
  return {
    attribute: 'fill',
    scale: {
      active: COUNTRY_ACTIVE,
      muted: COUNTRY_MUTED,
    },
    values: {
      [countryCode]: 'active',
    },
  };
}
