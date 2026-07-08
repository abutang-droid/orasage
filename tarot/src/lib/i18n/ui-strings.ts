import { useMemo } from 'react';
import type { Lang } from './context';
import { useLang } from './context';

export type LangMap = Partial<Record<Lang, string>>;

export function pick(map: LangMap, lang: Lang): string {
  return map[lang] ?? map.zh ?? '';
}

export const geo = {
  loadingMap: {
    zh: '正在加载世界地图…',
    en: 'Loading world map…',
    pt: 'Carregando mapa mundial…',
    es: 'Cargando mapa mundial…',
  },
  loadingCountries: {
    zh: '正在加载国家列表…',
    en: 'Loading countries…',
    pt: 'Carregando países…',
    es: 'Cargando países…',
  },
  loadingFaiths: {
    zh: '正在加载信仰列表…',
    en: 'Loading faiths…',
    pt: 'Carregando tradições…',
    es: 'Cargando tradiciones…',
  },
  loadingDeities: {
    zh: '正在加载守护神推荐…',
    en: 'Loading patron deities…',
    pt: 'Carregando deidades…',
    es: 'Cargando deidades…',
  },
  searchCountry: {
    zh: '搜索国家或地区…',
    en: 'Search country or region…',
    pt: 'Buscar país ou região…',
    es: 'Buscar país o región…',
  },
  defaultTitle: {
    zh: '第一步 · 你的心灵故乡',
    en: 'Step 1 · Your spiritual homeland',
    pt: 'Passo 1 · Sua terra espiritual',
    es: 'Paso 1 · Tu tierra espiritual',
  },
  defaultSubtitle: {
    zh: '从世界地图出发，找到与你最贴近的国家与信仰',
    en: 'Start from the world map to find the country and faith closest to you',
    pt: 'Comece pelo mapa para encontrar o país e a fé mais próximos de você',
    es: 'Empieza en el mapa para encontrar el país y la fe más cercanos a ti',
  },
  faithConfirm: {
    zh: '确认信仰，选择守护神',
    en: 'Confirm faith, choose patron',
    pt: 'Confirmar fé, escolher patrono',
    es: 'Confirmar fe, elegir patrón',
  },
  deityConfirm: {
    zh: '确认守护神',
    en: 'Confirm patron deity',
    pt: 'Confirmar deidade',
    es: 'Confirmar deidad',
  },
  stepContinent: {
    zh: '大洲',
    en: 'Continent',
    pt: 'Continente',
    es: 'Continente',
  },
  stepCountry: {
    zh: '国家',
    en: 'Country',
    pt: 'País',
    es: 'País',
  },
  stepFaith: {
    zh: '信仰',
    en: 'Faith',
    pt: 'Fé',
    es: 'Fe',
  },
  stepDeity: {
    zh: '守护神',
    en: 'Patron',
    pt: 'Patrono',
    es: 'Patrón',
  },
  confirmRegion: {
    zh: '确认大洲，选择国家',
    en: 'Confirm continent, choose country',
    pt: 'Confirmar continente, escolher país',
    es: 'Confirmar continente, elegir país',
  },
  confirmCountry: {
    zh: '确认国家，选择信仰',
    en: 'Confirm country, choose faith',
    pt: 'Confirmar país, escolher fé',
    es: 'Confirmar país, elegir fe',
  },
  nextFaith: {
    zh: '下一步 · 选择守护神',
    en: 'Next · Choose patron deity',
    pt: 'Próximo · Escolher patrono',
    es: 'Siguiente · Elegir patrón',
  },
  confirmCountryTitle: {
    zh: '确认你的国家',
    en: 'Confirm your country',
    pt: 'Confirme seu país',
    es: 'Confirma tu país',
  },
  back: {
    zh: '← 返回',
    en: '← Back',
    pt: '← Voltar',
    es: '← Volver',
  },
  progress: {
    zh: '进度',
    en: 'Progress',
    pt: 'Progresso',
    es: 'Progreso',
  },
  locating: {
    zh: '正在尝试根据你的位置识别国家…',
    en: 'Detecting your country from location…',
    pt: 'Detectando seu país pela localização…',
    es: 'Detectando tu país por ubicación…',
  },
  skipManual: {
    zh: '跳过，手动选择',
    en: 'Skip, choose manually',
    pt: 'Pular, escolher manualmente',
    es: 'Omitir, elegir manualmente',
  },
  detectLead: {
    zh: '根据{source}，我们判断你在',
    en: 'Based on {source}, we think you are in',
    pt: 'Com base em {source}, você está em',
    es: 'Según {source}, estás en',
  },
  detectQuestion: {
    zh: '这是你所在的国家吗？',
    en: 'Is this your country?',
    pt: 'Este é o seu país?',
    es: '¿Es este tu país?',
  },
  detectYes: {
    zh: '正确，继续',
    en: 'Yes, continue',
    pt: 'Sim, continuar',
    es: 'Sí, continuar',
  },
  detectNo: {
    zh: '不是，手动选择',
    en: 'No, choose manually',
    pt: 'Não, escolher manualmente',
    es: 'No, elegir manualmente',
  },
  listRegion: {
    zh: '列表选大洲',
    en: 'List continents',
    pt: 'Listar continentes',
    es: 'Listar continentes',
  },
  listCountry: {
    zh: '列表选国家',
    en: 'List countries',
    pt: 'Listar países',
    es: 'Listar países',
  },
  listGeneric: {
    zh: '列表',
    en: 'List',
    pt: 'Lista',
    es: 'Lista',
  },
  close: {
    zh: '关闭',
    en: 'Close',
    pt: 'Fechar',
    es: 'Cerrar',
  },
  closeList: {
    zh: '关闭列表',
    en: 'Close list',
    pt: 'Fechar lista',
    es: 'Cerrar lista',
  },
  confirmSelection: {
    zh: '确认选择',
    en: 'Confirm selection',
    pt: 'Confirmar seleção',
    es: 'Confirmar selección',
  },
  change: {
    zh: '更改',
    en: 'Change',
    pt: 'Alterar',
    es: 'Cambiar',
  },
  selectedBy: {
    zh: '已根据{source}选择',
    en: 'Selected via {source}',
    pt: 'Selecionado via {source}',
    es: 'Seleccionado vía {source}',
  },
  noDeity: {
    zh: '此信仰暂未开放守护神，请返回上一步选择其他信仰。',
    en: 'No patron deities for this faith yet. Go back and choose another faith.',
    pt: 'Ainda não há patronos para esta fé. Volte e escolha outra tradição.',
    es: 'Aún no hay patronos para esta fe. Vuelve y elige otra tradición.',
  },
  sourceGps: {
    zh: '定位服务',
    en: 'location services',
    pt: 'serviços de localização',
    es: 'servicios de ubicación',
  },
  sourceIp: {
    zh: '网络位置',
    en: 'network location',
    pt: 'localização de rede',
    es: 'ubicación de red',
  },
  sourceManual: {
    zh: '手动选择',
    en: 'manual selection',
    pt: 'seleção manual',
    es: 'selección manual',
  },
  hintDetect: {
    zh: '根据{source}自动识别，请确认是否正确',
    en: 'Auto-detected via {source}. Please confirm.',
    pt: 'Detectado via {source}. Confirme.',
    es: 'Detectado vía {source}. Confirma.',
  },
  hintListRegion: {
    zh: '从下方列表选择你的大洲',
    en: 'Choose your continent from the list below',
    pt: 'Escolha seu continente na lista abaixo',
    es: 'Elige tu continente en la lista',
  },
  hintListCountry: {
    zh: '从下方列表选择你的国家',
    en: 'Choose your country from the list below',
    pt: 'Escolha seu país na lista abaixo',
    es: 'Elige tu país en la lista',
  },
  hintFaithRegional: {
    zh: '{country}的主流信仰推荐，选最贴近你内心的传统',
    en: 'Popular faiths in {country} — choose what resonates',
    pt: 'Fés populares em {country} — escolha o que ressoa',
    es: 'Fe popular en {country} — elige lo que resuene',
  },
  hintFaithGlobal: {
    zh: '请从完整列表中选择你的信仰或精神归属',
    en: 'Choose your faith or spiritual path from the full list',
    pt: 'Escolha sua fé ou caminho espiritual na lista completa',
    es: 'Elige tu fe o camino espiritual en la lista completa',
  },
  hintDeity: {
    zh: '根据你的信仰，推荐以下守护神',
    en: 'Recommended patron deities for your faith',
    pt: 'Patronos recomendados para sua fé',
    es: 'Patronos recomendados para tu fe',
  },
  hintRegionMap: {
    zh: '在地图上点选任意国家，或从列表选择大洲',
    en: 'Tap a country on the map or pick a continent from the list',
    pt: 'Toque um país no mapa ou escolha um continente',
    es: 'Toca un país en el mapa o elige un continente',
  },
  hintCountryMap: {
    zh: '点选你的国家，确认后继续',
    en: 'Tap your country, then confirm to continue',
    pt: 'Toque seu país e confirme para continuar',
    es: 'Toca tu país y confirma para continuar',
  },
  titleCountry: {
    zh: '选择国家 · {name}',
    en: 'Choose country · {name}',
    pt: 'Escolher país · {name}',
    es: 'Elegir país · {name}',
  },
  titleFaith: {
    zh: '选择信仰 · {name}',
    en: 'Choose faith · {name}',
    pt: 'Escolher fé · {name}',
    es: 'Elegir fe · {name}',
  },
  titleDeity: {
    zh: '选择守护神 · {name}',
    en: 'Choose patron · {name}',
    pt: 'Escolher patrono · {name}',
    es: 'Elegir patrón · {name}',
  },
  mapBg: {
    zh: '世界地图背景',
    en: 'World map background',
    pt: 'Mapa mundial',
    es: 'Mapa mundial',
  },
  mapRegion: {
    zh: '世界地图，点选国家以选择大洲',
    en: 'World map — tap a country to pick a continent',
    pt: 'Mapa — toque um país para escolher continente',
    es: 'Mapa — toca un país para elegir continente',
  },
  mapCountry: {
    zh: '区域地图，点选国家',
    en: 'Regional map — tap a country',
    pt: 'Mapa regional — toque um país',
    es: 'Mapa regional — toca un país',
  },
  mapFaith: {
    zh: '国家地图，点选信仰',
    en: 'Country map — tap a faith',
    pt: 'Mapa do país — toque uma fé',
    es: 'Mapa del país — toca una fe',
  },
  confirmCountryRegion: {
    zh: '确认国家',
    en: 'Confirm country',
    pt: 'Confirmar país',
    es: 'Confirmar país',
  },
} as const satisfies Record<string, LangMap>;

export const faith = {
  title: {
    zh: '你的信仰是什么？',
    en: 'What is your faith?',
    pt: 'Qual é a sua fé?',
    es: '¿Cuál es tu fe?',
  },
  subtitle: {
    zh: '选择最贴近你内心的传统，我们会据此推荐守护神与祈福方式',
    en: 'Choose the tradition closest to your heart — we will recommend patrons and rituals',
    pt: 'Escolha a tradição mais próxima do seu coração — recomendaremos patronos e rituais',
    es: 'Elige la tradición más cercana a tu corazón — recomendaremos patronos y rituales',
  },
  confirm: {
    zh: '确认',
    en: 'Confirm',
    pt: 'Confirmar',
    es: 'Confirmar',
  },
} as const satisfies Record<string, LangMap>;

export const temple = {
  patronLabel: {
    zh: '守护神',
    en: 'Patron deity',
    pt: 'Deidade patrono',
    es: 'Deidad patrón',
  },
  pickTitle: {
    zh: '选择守护神',
    en: 'Choose patron deity',
    pt: 'Escolher deidade patrono',
    es: 'Elegir deidad patrón',
  },
  pickWithFaith: {
    zh: '信仰：{faith}{country} · 选定守护神，即可开始参拜',
    en: 'Faith: {faith}{country} · Choose a patron to begin worship',
    pt: 'Fé: {faith}{country} · Escolha um patrono para começar',
    es: 'Fe: {faith}{country} · Elige un patrón para comenzar',
  },
  pickSimple: {
    zh: '点选一位守护神，即可开始参拜',
    en: 'Tap a patron deity to begin worship',
    pt: 'Toque um patrono para começar a adorar',
    es: 'Toca un patrón para comenzar la adoración',
  },
  backHome: {
    zh: '← 返回祈福首页',
    en: '← Back to temple home',
    pt: '← Voltar ao templo',
    es: '← Volver al templo',
  },
  searchDeity: {
    zh: '搜索你想拜的神明…',
    en: 'Search for a deity…',
    pt: 'Buscar uma divindade…',
    es: 'Buscar una deidad…',
  },
  loadingDeities: {
    zh: '正在加载守护神列表…',
    en: 'Loading patron deities…',
    pt: 'Carregando patronos…',
    es: 'Cargando patronos…',
  },
  noDeity: {
    zh: '此信仰暂未开放守护神，请先选择其他信仰。',
    en: 'No patron deities for this faith yet. Please choose another faith.',
    pt: 'Sem patronos para esta fé. Escolha outra tradição.',
    es: 'Sin patronos para esta fe. Elige otra tradición.',
  },
  loading: {
    zh: '加载祈福…',
    en: 'Loading temple…',
    pt: 'Carregando templo…',
    es: 'Cargando templo…',
  },
  myPatron: {
    zh: '我的守护神',
    en: 'My patron deity',
    pt: 'Meu patrono',
    es: 'Mi patrón',
  },
  worshipAgain: {
    zh: '再次参拜',
    en: 'Worship again',
    pt: 'Adorar novamente',
    es: 'Adorar de nuevo',
  },
  worshipToday: {
    zh: '今日参拜',
    en: 'Worship today',
    pt: 'Adorar hoje',
    es: 'Adorar hoy',
  },
  verseLabel: {
    zh: '── 今日偈语 ──',
    en: '── Today’s verse ──',
    pt: '── Verso de hoje ──',
    es: '── Verso de hoy ──',
  },
  verseAria: {
    zh: '今日偈语',
    en: 'Today’s verse',
    pt: 'Verso de hoje',
    es: 'Verso de hoy',
  },
  donationSuccess: {
    zh: '乐捐成功，功德已计入您的修行记录。',
    en: 'Donation received — merit added to your record.',
    pt: 'Doação recebida — mérito adicionado ao seu registro.',
    es: 'Donación recibida — mérito añadido a tu registro.',
  },
  changeFaithHint: {
    zh: '更换守护神或信仰地区，请前往',
    en: 'To change patron or region, go to',
    pt: 'Para trocar patrono ou região, vá em',
    es: 'Para cambiar patrón o región, ve a',
  },
} as const satisfies Record<string, LangMap>;

export function formatTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

export function useGeoCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      p,
      sourceLabel: {
        gps: p(geo.sourceGps),
        ip: p(geo.sourceIp),
        manual: p(geo.sourceManual),
      } as const,
    };
  }, [lang]);
}

export function useFaithCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return { title: p(faith.title), subtitle: p(faith.subtitle), confirm: p(faith.confirm) };
  }, [lang]);
}

export function useTempleCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      p,
      patronLabel: p(temple.patronLabel),
      pickTitle: p(temple.pickTitle),
      pickSimple: p(temple.pickSimple),
      backHome: p(temple.backHome),
      searchDeity: p(temple.searchDeity),
      loadingDeities: p(temple.loadingDeities),
      noDeity: p(temple.noDeity),
      loading: p(temple.loading),
      myPatron: p(temple.myPatron),
      worshipAgain: p(temple.worshipAgain),
      worshipToday: p(temple.worshipToday),
      verseLabel: p(temple.verseLabel),
      verseAria: p(temple.verseAria),
      donationSuccess: p(temple.donationSuccess),
      changeFaithHint: p(temple.changeFaithHint),
      pickWithFaith: (faith: string, country?: string | null) =>
        formatTemplate(p(temple.pickWithFaith), {
          faith,
          country: country ? ` · ${country}` : '',
        }),
    };
  }, [lang]);
}
