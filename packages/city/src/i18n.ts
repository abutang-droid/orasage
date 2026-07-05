export type CityLocale = "zh-CN" | "zh-TW" | "en" | "pt-BR";

export type CityMessages = {
  placeholder: string;
  aiMatching: string;
  notFound: string;
  parentHint: string;
  verifyHint: string;
  confirmTitle: string;
  confirmYes: string;
  confirmNo: string;
  longitudeEast: string;
  longitudeWest: string;
  timezone: string;
  loadFailed: string;
};

const MESSAGES: Record<CityLocale, CityMessages> = {
  "zh-CN": {
    placeholder: "请输入出生城市",
    aiMatching: "匹配中...",
    notFound: "未找到该城市，可尝试输入上级行政单位（如「湖北荆州」）或「国家+城市」",
    parentHint: "如不确定，可尝试输入省/市等上级行政单位",
    verifyHint: "匹配结果置信度较低，请核对是否为正确城市",
    confirmTitle: "是否确认为：",
    confirmYes: "确认",
    confirmNo: "重新输入",
    longitudeEast: "东经",
    longitudeWest: "西经",
    timezone: "时区",
    loadFailed: "城市数据加载失败",
  },
  "zh-TW": {
    placeholder: "請輸入出生城市",
    aiMatching: "匹配中...",
    notFound: "未找到該城市，可嘗試輸入上級行政單位（如「湖北荊州」）或「國家+城市」",
    parentHint: "如不確定，可嘗試輸入省/市等上級行政單位",
    verifyHint: "匹配結果置信度較低，請核對是否為正確城市",
    confirmTitle: "是否確認為：",
    confirmYes: "確認",
    confirmNo: "重新輸入",
    longitudeEast: "東經",
    longitudeWest: "西經",
    timezone: "時區",
    loadFailed: "城市資料載入失敗",
  },
  en: {
    placeholder: "Enter birthplace city",
    aiMatching: "Matching...",
    notFound: 'City not found. Try a parent region (e.g. "Hubei Jingzhou") or "Country+City"',
    parentHint: "If unsure, try entering province/state or parent region",
    verifyHint: "Low confidence match — please verify this is the correct city",
    confirmTitle: "Confirm city: ",
    confirmYes: "Confirm",
    confirmNo: "Re-enter",
    longitudeEast: "E",
    longitudeWest: "W",
    timezone: "TZ",
    loadFailed: "Failed to load city data",
  },
  "pt-BR": {
    placeholder: "Digite a cidade de nascimento",
    aiMatching: "Correspondendo...",
    notFound: 'Cidade não encontrada. Tente região superior ou "País+Cidade"',
    parentHint: "Se não tiver certeza, tente informar província/estado ou região superior",
    verifyHint: "Correspondência com baixa confiança — verifique se a cidade está correta",
    confirmTitle: "Confirmar cidade: ",
    confirmYes: "Confirmar",
    confirmNo: "Digitar novamente",
    longitudeEast: "L",
    longitudeWest: "O",
    timezone: "Fuso",
    loadFailed: "Falha ao carregar dados da cidade",
  },
};

export function getCityMessages(locale: string): CityMessages {
  if (locale in MESSAGES) return MESSAGES[locale as CityLocale];
  if (locale.startsWith("zh-TW") || locale.startsWith("zh-HK")) return MESSAGES["zh-TW"];
  if (locale.startsWith("pt")) return MESSAGES["pt-BR"];
  if (locale.startsWith("en")) return MESSAGES.en;
  return MESSAGES["zh-CN"];
}

export function formatCityLabel(city: string, country: string): string {
  if (country && country !== "中国") return `${city} · ${country}`;
  return city;
}

export const CONFIDENCE_THRESHOLD = 0.85;
