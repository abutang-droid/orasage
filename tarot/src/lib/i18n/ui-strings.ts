import { useMemo } from 'react';
import type { Lang } from './context';
import { useLang } from './context';

export type LangMap = Partial<Record<Lang, string>>;

export function pick(map: LangMap, lang: Lang): string {
  return map[lang] ?? map.en ?? map.pt ?? map.es ?? map.zh ?? '';
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
  useGps: {
    zh: '使用定位服务',
    en: 'Use location services',
    pt: 'Usar localização',
    es: 'Usar ubicación',
  },
  gpsFailed: {
    zh: '无法获取位置，请手动选择国家',
    en: 'Could not detect location — please choose your country manually',
    pt: 'Não foi possível detectar a localização — escolha o país manualmente',
    es: 'No se pudo detectar la ubicación — elige tu país manualmente',
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
  mapGestureHint: {
    zh: '双指缩放 · 拖动平移 · 点选地图',
    en: 'Pinch to zoom · drag to pan · tap to select',
    pt: 'Pinça para zoom · arraste · toque para selecionar',
    es: 'Pellizca para zoom · arrastra · toca para seleccionar',
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
  label: {
    zh: '信仰',
    en: 'Faith',
    pt: 'Fé',
    es: 'Fe',
  },
  current: {
    zh: '当前：{name}',
    en: 'Current: {name}',
    pt: 'Atual: {name}',
    es: 'Actual: {name}',
  },
  loading: {
    zh: '正在加载信仰列表…',
    en: 'Loading faiths…',
    pt: 'Carregando tradições…',
    es: 'Cargando tradiciones…',
  },
  selectedLead: {
    zh: '已选择 {name}，确认后将进入下一步',
    en: 'Selected {name} — confirm to continue',
    pt: 'Selecionado {name} — confirme para continuar',
    es: 'Seleccionado {name} — confirma para continuar',
  },
  reselect: {
    zh: '重新选择',
    en: 'Choose again',
    pt: 'Escolher de novo',
    es: 'Elegir de nuevo',
  },
  moreFaiths: {
    zh: '更多信仰 →',
    en: 'More faiths →',
    pt: 'Mais tradições →',
    es: 'Más tradiciones →',
  },
  moreFaithsTitle: {
    zh: '更多信仰',
    en: 'More faiths',
    pt: 'Mais tradições',
    es: 'Más tradiciones',
  },
  customLead: {
    zh: '写下你的信仰或精神归属名称',
    en: 'Write your faith or spiritual path',
    pt: 'Escreva sua fé ou caminho espiritual',
    es: 'Escribe tu fe o camino espiritual',
  },
  customPlaceholder: {
    zh: '例如：妈祖、象头神、个人灵性修行…',
    en: 'e.g. Mazu, Ganesha, personal spirituality…',
    pt: 'ex.: Mazu, Ganesha, espiritualidade pessoal…',
    es: 'p. ej. Mazu, Ganesha, espiritualidad personal…',
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
  worshipHold: {
    zh: '按住以持续参拜',
    en: 'Hold to continue worship',
    pt: 'Segure para continuar',
    es: 'Mantén para continuar',
  },
  worshipInProgress: {
    zh: '静心参拜中…',
    en: 'Worship in progress…',
    pt: 'Adoração em andamento…',
    es: 'Adoración en curso…',
  },
  worshipDeepening: {
    zh: '心诚渐深…',
    en: 'Devotion deepens…',
    pt: 'A devoção se aprofunda…',
    es: 'La devoción se profundiza…',
  },
  worshipReverence: {
    zh: '敬意渐浓…',
    en: 'Reverence grows…',
    pt: 'A reverência cresce…',
    es: 'La reverencia crece…',
  },
  worshipCompleteSoon: {
    zh: '圆满在即，可松手礼成',
    en: 'Almost complete — release to finish',
    pt: 'Quase completo — solte para terminar',
    es: 'Casi listo — suelta para terminar',
  },
  worshipAlmostDone: {
    zh: '礼成在即',
    en: 'Rite almost complete',
    pt: 'Rito quase completo',
    es: 'Rito casi completo',
  },
  worshipTapHint: {
    zh: '轻按守护神像，静心参拜',
    en: 'Press and hold the patron image to worship',
    pt: 'Pressione a imagem do patrono para adorar',
    es: 'Mantén la imagen del patrón para adorar',
  },
  worshipToast: {
    zh: '再按一会，{name}正在聆听',
    en: 'Hold a little longer — {name} is listening',
    pt: 'Segure um pouco mais — {name} está ouvindo',
    es: 'Mantén un poco más — {name} está escuchando',
  },
  worshipAria: {
    zh: '参拜 {name}',
    en: 'Worship {name}',
    pt: 'Adorar {name}',
    es: 'Adorar a {name}',
  },
  blessingPeak3: {
    zh: '诚心礼成',
    en: 'Heartfelt rite complete',
    pt: 'Rito sincero completo',
    es: 'Rito sincero completo',
  },
  blessingPeak2: {
    zh: '深度参拜',
    en: 'Deep worship',
    pt: 'Adoração profunda',
    es: 'Adoración profunda',
  },
  blessingPeak1: {
    zh: '参拜礼成',
    en: 'Worship complete',
    pt: 'Adoração concluída',
    es: 'Adoración completada',
  },
  blessingLead: {
    zh: '{name}已聆听你的心愿，愿护佑与你同行。',
    en: '{name} has heard your prayer — may their blessing walk with you.',
    pt: '{name} ouviu sua prece — que a bênção caminhe com você.',
    es: '{name} escuchó tu plegaria — que su bendición te acompañe.',
  },
  blessingGuideLabel: {
    zh: '── 今日指引 ──',
    en: '── Guidance for today ──',
    pt: '── Orientação de hoje ──',
    es: '── Guía de hoy ──',
  },
  blessingFallback: {
    zh: '你的心意已被看见——\n那些尚未说出口的话，\n今日宜向前走一步。',
    en: 'Your intention has been seen—\nwhat you have not yet spoken,\ntoday is a day to take one step forward.',
    pt: 'Sua intenção foi vista—\no que ainda não disse,\nhoje é dia de dar um passo à frente.',
    es: 'Tu intención ha sido vista—\nlo que aún no dijiste,\nhoy es un día para dar un paso adelante.',
  },
  blessingMeritRecorded: {
    zh: '今日功德已记录',
    en: 'Today’s merit recorded',
    pt: 'Mérito de hoje registrado',
    es: 'Mérito de hoy registrado',
  },
  blessingMeritGain: {
    zh: '+{n} 功德',
    en: '+{n} merit',
    pt: '+{n} mérito',
    es: '+{n} mérito',
  },
  blessingLevelUp: {
    zh: ' · 修行精进',
    en: ' · Practice advanced',
    pt: ' · Prática avançada',
    es: ' · Práctica avanzada',
  },
  blessingStreak: {
    zh: ' · 连续 {days} 天',
    en: ' · {days}-day streak',
    pt: ' · sequência de {days} dias',
    es: ' · racha de {days} días',
  },
  blessingFortuneCta: {
    zh: '去抽单牌阵',
    en: 'Draw single-card spread',
    pt: 'Tirar carta única',
    es: 'Sacar carta única',
  },
  blessingBack: {
    zh: '返回',
    en: 'Back',
    pt: 'Voltar',
    es: 'Volver',
  },
  statusPrayedLabel: {
    zh: '今日祈福',
    en: "Today's blessing",
    pt: 'Bênção de hoje',
    es: 'Bendición de hoy',
  },
  statusPrayedDone: {
    zh: '已完成',
    en: 'Done',
    pt: 'Concluído',
    es: 'Hecho',
  },
  statusPrayedPending: {
    zh: '未完成',
    en: 'Not yet',
    pt: 'Pendente',
    es: 'Pendiente',
  },
  statusStreakLabel: {
    zh: '连续参拜',
    en: 'Worship streak',
    pt: 'Sequência de adoração',
    es: 'Racha de adoración',
  },
  statusStreakDays: {
    zh: '{days} 天',
    en: '{days} days',
    pt: '{days} dias',
    es: '{days} días',
  },
  statusFortuneLabel: {
    zh: '单牌阵',
    en: 'Single-card spread',
    pt: 'Carta única',
    es: 'Carta única',
  },
  statusFortuneRemaining: {
    zh: '剩余 {n} 次',
    en: '{n} draws left',
    pt: '{n} restantes',
    es: '{n} restantes',
  },
  statusFortuneDaily: {
    zh: '每日 1 次',
    en: '1 per day',
    pt: '1 por dia',
    es: '1 por día',
  },
  statusTempleBonusHint: {
    zh: ' · 祈福可 +1',
    en: ' · Worship for +1',
    pt: ' · Adorar +1',
    es: ' · Adorar +1',
  },
  statusTempleBonusDone: {
    zh: ' · 已获祈福加成',
    en: ' · Temple bonus earned',
    pt: ' · Bônus do templo',
    es: ' · Bono del templo',
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
  settingsLink: {
    zh: '我的 → 设置',
    en: 'Profile → Settings',
    pt: 'Perfil → Configurações',
    es: 'Perfil → Ajustes',
  },
  meritAria: {
    zh: '我的功德',
    en: 'My merit',
    pt: 'Meu mérito',
    es: 'Mi mérito',
  },
  meritLoading: {
    zh: '加载功德…',
    en: 'Loading merit…',
    pt: 'Carregando mérito…',
    es: 'Cargando mérito…',
  },
  meritLabel: {
    zh: '我的功德',
    en: 'My merit',
    pt: 'Meu mérito',
    es: 'Mi mérito',
  },
  meritTimeOffer: {
    zh: '日积月累 {time} · 诚心供养 {offer}',
    en: 'Time path {time} · Offerings {offer}',
    pt: 'Caminho do tempo {time} · Ofertas {offer}',
    es: 'Camino del tiempo {time} · Ofrendas {offer}',
  },
  meritStreak: {
    zh: ' · 连续 {days} 天',
    en: ' · {days}-day streak',
    pt: ' · sequência de {days} dias',
    es: ' · racha de {days} días',
  },
  meritDetails: {
    zh: '查看功德详情 →',
    en: 'View merit details →',
    pt: 'Ver detalhes do mérito →',
    es: 'Ver detalles del mérito →',
  },
  leaderboardAria: {
    zh: '功德排行榜',
    en: 'Merit leaderboard',
    pt: 'Ranking de mérito',
    es: 'Clasificación de mérito',
  },
  leaderboardTitle: {
    zh: '功德排行榜',
    en: 'Merit leaderboard',
    pt: 'Ranking de mérito',
    es: 'Clasificación de mérito',
  },
  leaderboardSub: {
    zh: '持光者及以上信徒',
    en: 'Lightbearers and above',
    pt: 'Portadores da Luz em diante',
    es: 'Portadores de la Luz en adelante',
  },
  leaderboardEmpty: {
    zh: '暂无上榜信徒',
    en: 'No devotees on the board yet',
    pt: 'Nenhum devoto no ranking ainda',
    es: 'Aún no hay devotos en la lista',
  },
  donationAria: {
    zh: '乐捐',
    en: 'Donation',
    pt: 'Doação',
    es: 'Donación',
  },
} as const satisfies Record<string, LangMap>;

export const donation = {
  label: {
    zh: '── 自愿乐捐 ──',
    en: '── Voluntary offering ──',
    pt: '── Oferta voluntária ──',
    es: '── Ofrenda voluntaria ──',
  },
  explanation: {
    zh: '自愿供养，用于庙宇日常护持；功德计入您的修行记录。',
    en: 'Voluntary support for temple upkeep; merit is added to your record.',
    pt: 'Apoio voluntário ao templo; o mérito entra no seu registro.',
    es: 'Apoyo voluntario al templo; el mérito se añade a tu registro.',
  },
  estimatedMerit: {
    zh: '预计功德',
    en: 'Estimated merit',
    pt: 'Mérito estimado',
    es: 'Mérito estimado',
  },
  customAmount: {
    zh: '自定义金额',
    en: 'Custom amount',
    pt: 'Valor personalizado',
    es: 'Monto personalizado',
  },
  submitLoading: {
    zh: '跳转支付…',
    en: 'Redirecting to pay…',
    pt: 'Redirecionando…',
    es: 'Redirigiendo al pago…',
  },
  submit: {
    zh: '乐捐 {amount}',
    en: 'Donate {amount}',
    pt: 'Doar {amount}',
    es: 'Donar {amount}',
  },
  error: {
    zh: '乐捐失败',
    en: 'Donation failed',
    pt: 'Falha na doação',
    es: 'Error en la donación',
  },
} as const satisfies Record<string, LangMap>;

export const wish = {
  label: {
    zh: 'WISH DIVINATION',
    en: 'WISH DIVINATION',
    pt: 'WISH DIVINATION',
    es: 'WISH DIVINATION',
  },
  title: {
    zh: '心愿占卜',
    en: 'Wish reading',
    pt: 'Leitura de desejo',
    es: 'Lectura de deseo',
  },
  subtitle: {
    zh: '写下心愿，获取塔罗指引',
    en: 'Write a wish and receive tarot guidance',
    pt: 'Escreva um desejo e receba orientação do tarô',
    es: 'Escribe un deseo y recibe guía del tarot',
  },
  wishLabel: {
    zh: '你的心愿',
    en: 'Your wish',
    pt: 'Seu desejo',
    es: 'Tu deseo',
  },
  placeholder: {
    zh: '写下一个简短的心愿，例如：希望这段感情顺利…',
    en: 'Write a short wish, e.g. hoping this relationship goes well…',
    pt: 'Escreva um desejo curto, ex.: que este relacionamento dê certo…',
    es: 'Escribe un deseo breve, p. ej. que esta relación salga bien…',
  },
  divining: {
    zh: '占卜中…',
    en: 'Reading…',
    pt: 'Consultando…',
    es: 'Leyendo…',
  },
  submit: {
    zh: '一键占卜',
    en: 'Draw a card',
    pt: 'Tirar carta',
    es: 'Sacar carta',
  },
  cardDrawn: {
    zh: '抽到的牌',
    en: 'Card drawn',
    pt: 'Carta sorteada',
    es: 'Carta sacada',
  },
  upright: {
    zh: '↑ 正位',
    en: '↑ Upright',
    pt: '↑ Normal',
    es: '↑ Derecha',
  },
  reversed: {
    zh: '↓ 逆位',
    en: '↓ Reversed',
    pt: '↓ Invertida',
    es: '↓ Invertida',
  },
  again: {
    zh: '再次占卜',
    en: 'Read again',
    pt: 'Consultar de novo',
    es: 'Leer de nuevo',
  },
  conclusion: {
    可行: {
      zh: '可行',
      en: 'Go ahead',
      pt: 'Viável',
      es: 'Adelante',
    },
    蓄力: {
      zh: '蓄力',
      en: 'Build momentum',
      pt: 'Acumular',
      es: 'Acumular',
    },
    暂缓: {
      zh: '暂缓',
      en: 'Wait',
      pt: 'Aguardar',
      es: 'Esperar',
    },
  } as const satisfies Record<string, LangMap>,
  conclusionDesc: {
    可行: {
      zh: '星象支持，时机已到',
      en: 'The stars support you — the time is now',
      pt: 'Os astros apoiam — o momento é agora',
      es: 'Los astros te apoyan — el momento es ahora',
    },
    蓄力: {
      zh: '积累能量，静待时机',
      en: 'Gather energy and wait for the right moment',
      pt: 'Acumule energia e aguarde o momento certo',
      es: 'Acumula energía y espera el momento adecuado',
    },
    暂缓: {
      zh: '星象提示，需要耐心',
      en: 'The stars suggest patience',
      pt: 'Os astros pedem paciência',
      es: 'Los astros piden paciencia',
    },
  } as const satisfies Record<string, LangMap>,
  advice: [
    {
      zh: '大胆去做，宇宙在支持你的这个心愿。',
      en: 'Go for it — the universe supports this wish.',
      pt: 'Vá em frente — o universo apoia este desejo.',
      es: 'Hazlo — el universo apoya este deseo.',
    },
    {
      zh: '时机稍纵即逝，今天就行动起来。',
      en: 'The window is brief — act today.',
      pt: 'A janela é curta — aja hoje.',
      es: 'La ventana es breve — actúa hoy.',
    },
    {
      zh: '再准备一下会更好，不用急着出手。',
      en: 'A little more preparation will help — no rush.',
      pt: 'Um pouco mais de preparo ajuda — sem pressa.',
      es: 'Un poco más de preparación ayudará — sin prisa.',
    },
    {
      zh: '保持耐心，好事多磨。',
      en: 'Stay patient — good things take time.',
      pt: 'Tenha paciência — o bom leva tempo.',
      es: 'Ten paciencia — lo bueno toma tiempo.',
    },
    {
      zh: '跟随直觉走，你的心已经知道答案。',
      en: 'Follow your intuition — your heart already knows.',
      pt: 'Siga sua intuição — seu coração já sabe.',
      es: 'Sigue tu intuición — tu corazón ya lo sabe.',
    },
    {
      zh: '先放一放，过两天再回头看这个决定。',
      en: 'Set it aside and revisit this decision in a few days.',
      pt: 'Deixe de lado e reavalie em alguns dias.',
      es: 'Déjalo reposar y revisa esta decisión en unos días.',
    },
    {
      zh: '这个方向是对的，但节奏需要放慢一些。',
      en: 'The direction is right, but slow the pace.',
      pt: 'A direção está certa, mas diminua o ritmo.',
      es: 'La dirección es correcta, pero baja el ritmo.',
    },
    {
      zh: '缺少一些关键信息，先收集再行动。',
      en: 'Key information is missing — gather more before acting.',
      pt: 'Faltam informações — colete mais antes de agir.',
      es: 'Falta información clave — reúne más antes de actuar.',
    },
  ] as const satisfies ReadonlyArray<LangMap>,
} as const satisfies Record<string, LangMap | ReadonlyArray<LangMap> | Record<string, LangMap>>;

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
    return {
      lang,
      p,
      title: p(faith.title),
      subtitle: p(faith.subtitle),
      confirm: p(faith.confirm),
      label: p(faith.label),
      loading: p(faith.loading),
      reselect: p(faith.reselect),
      moreFaiths: p(faith.moreFaiths),
      moreFaithsTitle: p(faith.moreFaithsTitle),
      customLead: p(faith.customLead),
      customPlaceholder: p(faith.customPlaceholder),
      current: (name: string) => formatTemplate(p(faith.current), { name }),
      selectedLead: (name: string) => formatTemplate(p(faith.selectedLead), { name }),
    };
  }, [lang]);
}

export function useTempleCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      lang,
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
      worshipHold: p(temple.worshipHold),
      worshipInProgress: p(temple.worshipInProgress),
      worshipDeepening: p(temple.worshipDeepening),
      worshipReverence: p(temple.worshipReverence),
      worshipCompleteSoon: p(temple.worshipCompleteSoon),
      worshipAlmostDone: p(temple.worshipAlmostDone),
      worshipTapHint: p(temple.worshipTapHint),
      worshipToast: (name: string) => formatTemplate(p(temple.worshipToast), { name }),
      worshipAria: (name: string) => formatTemplate(p(temple.worshipAria), { name }),
      blessingPeak: (stage: number) =>
        p(stage === 3 ? temple.blessingPeak3 : stage === 2 ? temple.blessingPeak2 : temple.blessingPeak1),
      blessingLead: (name: string) => formatTemplate(p(temple.blessingLead), { name }),
      blessingGuideLabel: p(temple.blessingGuideLabel),
      blessingFallback: p(temple.blessingFallback),
      blessingMeritRecorded: p(temple.blessingMeritRecorded),
      blessingMeritGain: (n: number) => formatTemplate(p(temple.blessingMeritGain), { n: String(n) }),
      blessingLevelUp: p(temple.blessingLevelUp),
      blessingStreak: (days: number) => formatTemplate(p(temple.blessingStreak), { days: String(days) }),
      blessingFortuneCta: p(temple.blessingFortuneCta),
      blessingBack: p(temple.blessingBack),
      statusPrayedLabel: p(temple.statusPrayedLabel),
      statusPrayedDone: p(temple.statusPrayedDone),
      statusPrayedPending: p(temple.statusPrayedPending),
      statusStreakLabel: p(temple.statusStreakLabel),
      statusStreakDays: (days: number) => formatTemplate(p(temple.statusStreakDays), { days: String(days) }),
      statusFortuneLabel: p(temple.statusFortuneLabel),
      statusFortuneRemaining: (n: number) => formatTemplate(p(temple.statusFortuneRemaining), { n: String(n) }),
      statusFortuneDaily: p(temple.statusFortuneDaily),
      statusTempleBonusHint: p(temple.statusTempleBonusHint),
      statusTempleBonusDone: p(temple.statusTempleBonusDone),
      verseLabel: p(temple.verseLabel),
      verseAria: p(temple.verseAria),
      donationSuccess: p(temple.donationSuccess),
      changeFaithHint: p(temple.changeFaithHint),
      settingsLink: p(temple.settingsLink),
      meritAria: p(temple.meritAria),
      meritLoading: p(temple.meritLoading),
      meritLabel: p(temple.meritLabel),
      meritDetails: p(temple.meritDetails),
      leaderboardAria: p(temple.leaderboardAria),
      leaderboardTitle: p(temple.leaderboardTitle),
      leaderboardSub: p(temple.leaderboardSub),
      leaderboardEmpty: p(temple.leaderboardEmpty),
      donationAria: p(temple.donationAria),
      meritTimeOffer: (time: number, offer: number) =>
        formatTemplate(p(temple.meritTimeOffer), { time: String(time), offer: String(offer) }),
      meritStreak: (days: number) => formatTemplate(p(temple.meritStreak), { days: String(days) }),
      pickWithFaith: (faith: string, country?: string | null) =>
        formatTemplate(p(temple.pickWithFaith), {
          faith,
          country: country ? ` · ${country}` : '',
        }),
    };
  }, [lang]);
}

export function useDonationCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      label: p(donation.label),
      explanation: p(donation.explanation),
      estimatedMerit: p(donation.estimatedMerit),
      customAmount: p(donation.customAmount),
      submitLoading: p(donation.submitLoading),
      submit: (amount: string) => formatTemplate(p(donation.submit), { amount }),
      error: p(donation.error),
    };
  }, [lang]);
}

export function useWishCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    const conclusionKey = (key: string) => {
      const map = wish.conclusion[key as keyof typeof wish.conclusion];
      return map ? p(map) : key;
    };
    const conclusionDesc = (key: string) => {
      const map = wish.conclusionDesc[key as keyof typeof wish.conclusionDesc];
      return map ? p(map) : '';
    };
    return {
      label: p(wish.label as LangMap),
      title: p(wish.title as LangMap),
      subtitle: p(wish.subtitle as LangMap),
      wishLabel: p(wish.wishLabel as LangMap),
      placeholder: p(wish.placeholder as LangMap),
      divining: p(wish.divining as LangMap),
      submit: p(wish.submit as LangMap),
      cardDrawn: p(wish.cardDrawn as LangMap),
      upright: p(wish.upright as LangMap),
      reversed: p(wish.reversed as LangMap),
      again: p(wish.again as LangMap),
      conclusionKey,
      conclusionDesc,
      adviceAt: (idx: number) => {
        const row = wish.advice[idx % wish.advice.length];
        return row ? p(row) : '';
      },
      conclusionStyle: (key: string) => {
        const styles: Record<string, { color: string; bg: string }> = {
          可行: { color: 'var(--green)', bg: 'var(--green-pale)' },
          蓄力: { color: 'var(--gold)', bg: 'var(--gold-pale)' },
          暂缓: { color: 'var(--rose)', bg: 'var(--rose-pale)' },
        };
        return styles[key] ?? { color: 'var(--gold)', bg: 'var(--gold-pale)' };
      },
    };
  }, [lang]);
}
