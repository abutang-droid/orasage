import { useMemo } from 'react';
import type { Lang } from './context';
import { useLang } from './context';
import type { LangMap } from './ui-strings';
import { pick } from './ui-strings';

export const POSITION_KEYS = ['过去', '现在', '未来'] as const;
export type PositionKey = (typeof POSITION_KEYS)[number];

const common = {
  loadFailed: {
    zh: '加载失败',
    en: 'Failed to load',
    pt: 'Falha ao carregar',
    es: 'Error al cargar',
  },
  questionsFailed: {
    zh: '问题加载失败，请重试',
    en: 'Could not load questions. Please try again.',
    pt: 'Não foi possível carregar as perguntas. Tente novamente.',
    es: 'No se pudieron cargar las preguntas. Inténtalo de nuevo.',
  },
  checkoutFailed: {
    zh: '结账失败',
    en: 'Checkout failed',
    pt: 'Falha no checkout',
    es: 'Error en el pago',
  },
  redirecting: {
    zh: '跳转中…',
    en: 'Redirecting…',
    pt: 'Redirecionando…',
    es: 'Redirigiendo…',
  },
  backHome: {
    zh: '返回首页',
    en: 'Back to home',
    pt: 'Voltar ao início',
    es: 'Volver al inicio',
  },
  questionProgress: {
    zh: '问题 {current} / {total}',
    en: 'Question {current} / {total}',
    pt: 'Pergunta {current} / {total}',
    es: 'Pregunta {current} / {total}',
  },
  upright: {
    zh: '正位',
    en: 'Upright',
    pt: 'Normal',
    es: 'Derecha',
  },
  reversed: {
    zh: '逆位',
    en: 'Reversed',
    pt: 'Invertida',
    es: 'Invertida',
  },
  synthesis: {
    zh: '综合',
    en: 'Overall',
    pt: 'Geral',
    es: 'General',
  },
  traveler: {
    zh: '旅人',
    en: 'Traveler',
    pt: 'Viajante',
    es: 'Viajero',
  },
  loginDefaultTitle: {
    zh: '登录查看完整内容',
    en: 'Sign in to view full content',
    pt: 'Entre para ver o conteúdo completo',
    es: 'Inicia sesión para ver el contenido completo',
  },
  loginDefaultCta: {
    zh: '登录 / 注册',
    en: 'Sign in / Register',
    pt: 'Entrar / Registrar',
    es: 'Iniciar sesión / Registrarse',
  },
} as const satisfies Record<string, LangMap>;

const positions: Record<PositionKey, LangMap> = {
  过去: { zh: '过去', en: 'Past', pt: 'Passado', es: 'Pasado' },
  现在: { zh: '现在', en: 'Present', pt: 'Presente', es: 'Presente' },
  未来: { zh: '未来', en: 'Future', pt: 'Futuro', es: 'Futuro' },
};

const positionSublabels: Record<PositionKey, LangMap> = {
  过去: { zh: '因由 / 历史数据', en: 'Cause / Historical data', pt: 'Causa / Dados históricos', es: 'Causa / Datos históricos' },
  现在: { zh: '现状 / 实时状态', en: 'Status / Live state', pt: 'Status / Estado em tempo real', es: 'Estado / Condición en vivo' },
  未来: { zh: '推演 / 预期走向', en: 'Projection / Expected trajectory', pt: 'Projeção / Trajetória esperada', es: 'Proyección / Trayectoria esperada' },
};

const threeCard = {
  label: { zh: '脉络解构', en: 'Trilogy', pt: 'Trilogia', es: 'Trilogía' },
  title: {
    zh: '脉络解构 // TRILOGY',
    en: 'Trilogy // TRILOGY',
    pt: 'Trilogia // TRILOGY',
    es: 'Trilogía // TRILOGY',
  },
  statusBadge: {
    zh: '[ 状态：多维数据链条 // 线性逻辑推演 ]',
    en: '[ Status: multi-dimensional chain // linear inference ]',
    pt: '[ Status: cadeia multidimensional // inferência linear ]',
    es: '[ Estado: cadena multidimensional // inferencia lineal ]',
  },
  subtitle: {
    zh: '',
    en: '',
    pt: '',
    es: '',
  },
  introLead: {
    zh: '任何现状都有其历史冗余与未来惯性。\n引入三维矢量，解构事件的「因、现、果」。\n请输入或默念你复杂的困惑，依次提取三帧时空切片。',
    en: 'Every present state carries historical redundancy and future inertia.\nIntroduce a three-dimensional vector to deconstruct cause, present, and outcome.\nEnter or hold your complex dilemma in mind, then extract three temporal slices in sequence.',
    pt: 'Todo presente carrega redundância histórica e inércia futura.\nIntroduza um vetor tridimensional para decompor causa, presente e resultado.\nDigite ou mentalize seu dilema complexo e extraia três fatias temporais em sequência.',
    es: 'Todo presente lleva redundancia histórica e inercia futura.\nIntroduce un vector tridimensional para deconstruir causa, presente y resultado.\nEscribe o mentaliza tu dilema complejo y extrae tres fragmentos temporales en secuencia.',
  },
  questionLabel: {
    zh: '困惑点（可选）',
    en: 'Dilemma (optional)',
    pt: 'Dilema (opcional)',
    es: 'Dilema (opcional)',
  },
  questionPlaceholder: {
    zh: '例如：这段关系的走向？事业转型的时机？',
    en: 'e.g. Where is this relationship heading? Timing for a career shift?',
    pt: 'ex.: Rumo deste relacionamento? Momento para mudança de carreira?',
    es: 'p. ej. ¿Rumbo de esta relación? ¿Momento para un cambio de carrera?',
  },
  start: {
    zh: '开始提取切片',
    en: 'Begin extraction',
    pt: 'Iniciar extração',
    es: 'Iniciar extracción',
  },
  sensing: {
    zh: 'Manto 正在感应你的问题…',
    en: 'Manto is sensing your question…',
    pt: 'Manto está captando sua pergunta…',
    es: 'Manto está captando tu pregunta…',
  },
  sensingHint: {
    zh: 'AI 正在准备引导问答，请稍候',
    en: 'AI is preparing guided questions — please wait',
    pt: 'A IA está preparando as perguntas — aguarde',
    es: 'La IA está preparando las preguntas — espera',
  },
  drawing: {
    zh: '正在映射三帧时空切片…',
    en: 'Mapping three temporal slices…',
    pt: 'Mapeando três fatias temporais…',
    es: 'Mapeando tres fragmentos temporales…',
  },
  drawingHint: {
    zh: '过去 · 现在 · 未来，矢量链条成形中',
    en: 'Past · Present · Future — vector chain forming',
    pt: 'Passado · Presente · Futuro — cadeia vetorial se forma',
    es: 'Pasado · Presente · Futuro — cadena vectorial formándose',
  },
  tapReveal: {
    zh: '轻触翻开第 {n} 帧切片',
    en: 'Tap to reveal slice {n}',
    pt: 'Toque para revelar fatia {n}',
    es: 'Toca para revelar fragmento {n}',
  },
  briefGenerating: {
    zh: '正在加载字面释义…',
    en: 'Loading literal meanings…',
    pt: 'Carregando significados literais…',
    es: 'Cargando significados literales…',
  },
  allRevealed: {
    zh: '三张牌已全部翻开',
    en: 'All three cards are revealed',
    pt: 'As três cartas foram reveladas',
    es: 'Las tres cartas están reveladas',
  },
  writingBrief: {
    zh: '正在提取字面释义…',
    en: 'Extracting literal meanings…',
    pt: 'Extraindo significados literais…',
    es: 'Extrayendo significados literales…',
  },
  writingBriefHint: {
    zh: '未付费前仅展示牌面标准字面意思',
    en: 'Free tier shows standard literal card meanings only',
    pt: 'Nível grátis mostra apenas significados literais padrão',
    es: 'Nivel gratis muestra solo significados literales estándar',
  },
  freeBrief: { zh: '字面释义', en: 'Literal meaning', pt: 'Significado literal', es: 'Significado literal' },
  unlockLead: {
    zh: '解锁脉络解构，获取三牌链路推演与破局阈值',
    en: 'Unlock Trilogy for chain analysis and action threshold',
    pt: 'Desbloqueie a Trilogia para análise de cadeia e limiar de ação',
    es: 'Desbloquea la Trilogía para análisis de cadena y umbral de acción',
  },
  loginUnlock: {
    zh: '登录解锁脉络解构',
    en: 'Sign in to unlock Trilogy',
    pt: 'Entrar para desbloquear Trilogia',
    es: 'Inicia sesión para desbloquear Trilogía',
  },
  viewPlans: {
    zh: '查看解锁方案',
    en: 'View unlock options',
    pt: 'Ver opções de desbloqueio',
    es: 'Ver opciones de desbloqueo',
  },
  paywallTitle: {
    zh: '解锁脉络解构',
    en: 'Unlock Trilogy',
    pt: 'Desbloquear Trilogia',
    es: 'Desbloquear Trilogía',
  },
  paywallMessage: {
    zh: '访客可免费抽牌与查看字面释义。链路推演需登录后购买解锁。',
    en: 'Guests can draw cards and view literal meanings for free. Chain analysis requires sign-in and purchase.',
    pt: 'Visitantes podem tirar cartas e ver significados literais grátis. Análise de cadeia exige conta e compra.',
    es: 'Los visitantes pueden sacar cartas y ver significados literales gratis. El análisis de cadena requiere cuenta y compra.',
  },
  paywallHint: {
    zh: '登录后将自动回到本页，已抽的牌与字面释义不会丢失。',
    en: 'After sign-in you will return here; cards and literal meanings are kept.',
    pt: 'Após entrar você volta aqui; cartas e significados literais são mantidos.',
    es: 'Tras iniciar sesión volverás aquí; cartas y significados literales se conservan.',
  },
  paywallCta: { zh: '去登录', en: 'Sign in', pt: 'Entrar', es: 'Iniciar sesión' },
  tier1Title: {
    zh: '方案一 · 脉络解构',
    en: 'Option 1 · Trilogy analysis',
    pt: 'Opção 1 · Análise Trilogia',
    es: 'Opción 1 · Análisis Trilogía',
  },
  tier1Fallback: {
    zh: '三牌链路推演报告',
    en: 'Three-card chain analysis report',
    pt: 'Relatório de cadeia de três cartas',
    es: 'Informe de cadena de tres cartas',
  },
  buyReport: {
    zh: '购买脉络解构',
    en: 'Purchase Trilogy',
    pt: 'Comprar Trilogia',
    es: 'Comprar Trilogía',
  },
  tier2Title: {
    zh: '方案二 · 报告 + 开运物',
    en: 'Option 2 · Report + charm',
    pt: 'Opção 2 · Relatório + amuleto',
    es: 'Opción 2 · Informe + amuleto',
  },
  tier2Fallback: {
    zh: '完整报告 + 专属开运物品组合',
    en: 'Full report + exclusive charm bundle',
    pt: 'Relatório completo + kit de amuletos',
    es: 'Informe completo + kit de amuletos',
  },
  buyBundle: {
    zh: '购买报告套装',
    en: 'Purchase report bundle',
    pt: 'Comprar pacote',
    es: 'Comprar paquete',
  },
  paidView: {
    zh: '我已付款，查看脉络解构',
    en: 'I paid — view Trilogy',
    pt: 'Já paguei — ver Trilogia',
    es: 'Ya pagué — ver Trilogía',
  },
  backBrief: { zh: '返回字面释义', en: 'Back to literal meanings', pt: 'Voltar aos significados literais', es: 'Volver a significados literales' },
  sectionArchitecture: { zh: '[ 架构定义 ]', en: '[ Architecture ]', pt: '[ Arquitetura ]', es: '[ Arquitectura ]' },
  modeLabel: { zh: '模式', en: 'Mode', pt: 'Modo', es: 'Modo' },
  sectionNodes: { zh: '[ 节点测绘 ]', en: '[ Node mapping ]', pt: '[ Mapeamento de nós ]', es: '[ Mapeo de nodos ]' },
  sectionChain: { zh: '[ 链路推演 ]', en: '[ Chain inference ]', pt: '[ Inferência de cadeia ]', es: '[ Inferencia de cadena ]' },
  sectionThreshold: { zh: '[ 行动阈值 ]', en: '[ Action threshold ]', pt: '[ Limiar de ação ]', es: '[ Umbral de acción ]' },
  fullSynthesis: {
    zh: '综合解读',
    en: 'Overall interpretation',
    pt: 'Interpretação geral',
    es: 'Interpretación general',
  },
  suggestions: {
    zh: '行动建议',
    en: 'Action suggestions',
    pt: 'Sugestões de ação',
    es: 'Sugerencias de acción',
  },
  bundleNote: {
    zh: '你购买的是报告+开运物套装，物品将按订单地址寄送。',
    en: 'You purchased the report + charm bundle; items ship to your order address.',
    pt: 'Você comprou relatório + amuletos; os itens serão enviados ao endereço do pedido.',
    es: 'Compraste informe + amuletos; los artículos se enviarán a la dirección del pedido.',
  },
  viewOrders: {
    zh: '查看订单 →',
    en: 'View orders →',
    pt: 'Ver pedidos →',
    es: 'Ver pedidos →',
  },
  again: { zh: '再占一次', en: 'Read again', pt: 'Consultar de novo', es: 'Leer de nuevo' },
  drawFailed: {
    zh: '抽牌失败',
    en: 'Card draw failed',
    pt: 'Falha ao tirar cartas',
    es: 'Error al sacar cartas',
  },
  briefFailed: {
    zh: '简读生成失败',
    en: 'Brief reading failed',
    pt: 'Falha na leitura breve',
    es: 'Error en la lectura breve',
  },
  fullFailed: {
    zh: '详读加载失败',
    en: 'Full report failed to load',
    pt: 'Falha ao carregar relatório',
    es: 'Error al cargar informe',
  },
  loginBeforeBuy: {
    zh: '请先登录后再购买完整报告',
    en: 'Please sign in before purchasing the full report',
    pt: 'Entre antes de comprar o relatório completo',
    es: 'Inicia sesión antes de comprar el informe completo',
  },
} as const satisfies Record<string, LangMap>;

const singleCard = {
  label: { zh: '定命切片', en: 'Destiny Slice', pt: 'Fatia do Destino', es: 'Fragmento del Destino' },
  title: {
    zh: '定命切片 // FOCUS',
    en: 'Destiny Slice // FOCUS',
    pt: 'Fatia do Destino // FOCUS',
    es: 'Fragmento del Destino // FOCUS',
  },
  statusBadge: {
    zh: '[ 状态：单点高能聚焦 // 非零即一判断 ]',
    en: '[ Status: single-point focus // binary tendency ]',
    pt: '[ Status: foco de ponto único // tendência binária ]',
    es: '[ Estado: foco de punto único // tendencia binaria ]',
  },
  subtitle: {
    zh: '',
    en: '',
    pt: '',
    es: '',
  },
  introLead: {
    zh: '剥离冗余信息，锁定当下坐标。\n请在脑海中固化一个具备明确方向的「是非题」或「抉择点」。\n点击抽取，获取当前时空的确定性切片。',
    en: 'Strip redundant noise and lock your current coordinates.\nFix a clear yes/no question or decision point in your mind.\nTap to draw and receive a deterministic slice for this moment.',
    pt: 'Elimine ruído redundante e fixe suas coordenadas atuais.\nCristalize na mente uma pergunta sim/não ou ponto de decisão.\nToque para tirar e obter uma fatia determinística deste momento.',
    es: 'Elimina ruido redundante y fija tus coordenadas actuales.\nCristaliza en la mente una pregunta sí/no o punto de decisión.\nToca para sacar y obtener un fragmento determinista de este momento.',
  },
  questionLabel: {
    zh: '抉择点（可选）',
    en: 'Decision point (optional)',
    pt: 'Ponto de decisão (opcional)',
    es: 'Punto de decisión (opcional)',
  },
  questionPlaceholder: {
    zh: '示例：「此项计划是否通过？」 / 「当前的对立状态是否会打破？」',
    en: 'e.g. "Will this plan pass?" / "Will the current opposition break?"',
    pt: 'ex.: "Este plano será aprovado?" / "A oposição atual será rompida?"',
    es: 'p. ej. "¿Se aprobará este plan?" / "¿Se romperá la oposición actual?"',
  },
  deckHint: {
    zh: '滑动牌堆，点选一张',
    en: 'Swipe the spread and tap one card',
    pt: 'Deslize o baralho e toque uma carta',
    es: 'Desliza el mazo y toca una carta',
  },
  pickCard: {
    zh: '选牌',
    en: 'Pick card',
    pt: 'Escolher carta',
    es: 'Elegir carta',
  },
  drawing: {
    zh: '正在翻开你选中的牌…',
    en: 'Revealing your chosen card…',
    pt: 'Revelando sua carta escolhida…',
    es: 'Revelando tu carta elegida…',
  },
  drawingHint: {
    zh: '牌已入手，命运切片正在成形',
    en: 'The card is yours — your slice of destiny is forming',
    pt: 'A carta é sua — sua fatia do destino está se formando',
    es: 'La carta es tuya — tu fragmento del destino se forma',
  },
  cardRevealed: {
    zh: '牌面已定',
    en: 'Your card is set',
    pt: 'Sua carta está definida',
    es: 'Tu carta está definida',
  },
  cardFlipping: {
    zh: '正在感应牌面…',
    en: 'Sensing your card…',
    pt: 'Captando sua carta…',
    es: 'Captando tu carta…',
  },
  writingGuidance: {
    zh: '正在生成数据切片…',
    en: 'Generating data slice…',
    pt: 'Gerando fatia de dados…',
    es: 'Generando fragmento de datos…',
  },
  writingGuidanceHint: {
    zh: '冷峻解析牌面，输出倾向性坐标',
    en: 'Cold analysis mapping card to tendency coordinates',
    pt: 'Análise fria mapeando carta para coordenadas de tendência',
    es: 'Análisis frío mapeando carta a coordenadas de tendencia',
  },
  drawAgain: {
    zh: '再抽一张',
    en: 'Draw again',
    pt: 'Tirar de novo',
    es: 'Sacar de nuevo',
  },
  drawFailed: {
    zh: '抽牌失败',
    en: 'Draw failed',
    pt: 'Falha ao tirar carta',
    es: 'Error al sacar carta',
  },
  guidanceFailed: {
    zh: '指引生成失败',
    en: 'Could not generate guidance',
    pt: 'Falha ao gerar orientação',
    es: 'Error al generar guía',
  },
  sectionTendency: { zh: '[ 倾向判定 ]', en: '[ Tendency ]', pt: '[ Tendência ]', es: '[ Tendencia ]' },
  coreTendencyLabel: { zh: '核心倾向', en: 'Core tendency', pt: 'Tendência central', es: 'Tendencia central' },
  energyProbabilityLabel: { zh: '能量概率', en: 'Energy probability', pt: 'Probabilidade energética', es: 'Probabilidad energética' },
  sectionDeconstruction: { zh: '[ 现状解构 ]', en: '[ Deconstruction ]', pt: '[ Desconstrução ]', es: '[ Deconstrucción ]' },
  sectionThreshold: { zh: '[ 破局阈值 ]', en: '[ Threshold ]', pt: '[ Limiar ]', es: '[ Umbral ]' },
  paywallTitle: {
    zh: '解锁数据切片',
    en: 'Unlock data slice',
    pt: 'Desbloquear fatia de dados',
    es: 'Desbloquear fragmento de datos',
  },
  paywallDesc: {
    zh: '牌已抽出。付费一次永久解锁，即可查看本次及今后每一次的倾向性切片。',
    en: 'Your card is drawn. Pay once to permanently unlock tendency slices for this and every future reading.',
    pt: 'Sua carta foi tirada. Pague uma vez para desbloquear permanentemente as fatias de tendência.',
    es: 'Tu carta está sacada. Paga una vez para desbloquear permanentemente los fragmentos de tendencia.',
  },
  paywallMessage: {
    zh: '查看数据切片需登录 orasage 账号后购买，解锁后永久可用。',
    en: 'Viewing the data slice requires an orasage account. Unlock once, use forever.',
    pt: 'Ver a fatia exige conta orasage. Desbloqueie uma vez, use para sempre.',
    es: 'Ver el fragmento requiere cuenta orasage. Desbloquea una vez, usa para siempre.',
  },
  paywallHint: {
    zh: '抽牌免费；登录后可付费解锁查看切片',
    en: 'Drawing is free; sign in to unlock the slice',
    pt: 'Tirar carta é grátis; entre para desbloquear a fatia',
    es: 'Sacar carta es gratis; inicia sesión para desbloquear el fragmento',
  },
  paywallCta: {
    zh: '登录 / 注册',
    en: 'Sign in / Register',
    pt: 'Entrar / Registrar',
    es: 'Iniciar sesión / Registrarse',
  },
  paywallFallback: {
    zh: '定命切片 · 一次付费永久解锁',
    en: 'Destiny Slice · pay once, unlock forever',
    pt: 'Fatia do Destino · pague uma vez, desbloqueie para sempre',
    es: 'Fragmento del Destino · paga una vez, desbloquea para siempre',
  },
  buyUnlock: {
    zh: '付费查看切片',
    en: 'Unlock slice',
    pt: 'Desbloquear fatia',
    es: 'Desbloquear fragmento',
  },
  unlockForever: {
    zh: '一次付费，永久解锁所有数据切片',
    en: 'Pay once — unlock all data slices forever',
    pt: 'Pague uma vez — desbloqueie todas as fatias para sempre',
    es: 'Paga una vez — desbloquea todos los fragmentos para siempre',
  },
  resultLockedHint: {
    zh: '数据切片已就绪，解锁后即可查看',
    en: 'Your data slice is ready — unlock to view',
    pt: 'Sua fatia está pronta — desbloqueie para ver',
    es: 'Tu fragmento está listo — desbloquea para ver',
  },
  loginBeforeBuy: {
    zh: '请先登录后再购买解锁',
    en: 'Please sign in before purchasing unlock',
    pt: 'Entre antes de comprar o desbloqueio',
    es: 'Inicia sesión antes de comprar el desbloqueo',
  },
} as const satisfies Record<string, LangMap>;

const dailyFortune = {
  label: { zh: '今日启示', en: "Today's insight", pt: 'Revelação de hoje', es: 'Revelación de hoy' },
  title: {
    zh: '今日四维运势',
    en: "Today's four-dimension fortune",
    pt: 'Fortuna de hoje em quatro dimensões',
    es: 'Fortuna de hoy en cuatro dimensiones',
  },
  dimsSubtitle: {
    zh: '工作 · 爱情 · 事业 · 财运',
    en: 'Work · Love · Career · Wealth',
    pt: 'Trabalho · Amor · Carreira · Riqueza',
    es: 'Trabajo · Amor · Carrera · Riqueza',
  },
  quotaAllowance: { zh: '今日可抽', en: 'Draws today', pt: 'Sorteios hoje', es: 'Tiradas hoy' },
  quotaRemaining: { zh: '剩余次数', en: 'Remaining', pt: 'Restantes', es: 'Restantes' },
  times: { zh: '{n} 次', en: '{n}', pt: '{n}x', es: '{n}' },
  introLead: {
    zh: '将注意力放在今天，跟随直觉翻开你的今日主牌。',
    en: 'Focus on today and follow your intuition to reveal your card.',
    pt: 'Coloque a atenção no hoje e siga a intuição para revelar sua carta.',
    es: 'Pon la atención en el hoy y sigue la intuición para revelar tu carta.',
  },
  introTitle: {
    zh: '今日塔罗',
    en: "Today's Tarot",
    pt: 'Tarô de hoje',
    es: 'Tarot de hoy',
  },
  introSubtitle: {
    zh: '今天属于你的指引是什么？',
    en: 'What guidance belongs to you today?',
    pt: 'Qual orientação é sua hoje?',
    es: '¿Qué guía te pertenece hoy?',
  },
  tapToDraw: {
    zh: '点击抽牌',
    en: 'Tap to draw',
    pt: 'Toque para tirar',
    es: 'Toca para sacar',
  },
  introCalm1: {
    zh: '请放松心情。',
    en: 'Relax your mind.',
    pt: 'Relaxe a mente.',
    es: 'Relaja la mente.',
  },
  introCalm2: {
    zh: '将注意力放在今天。',
    en: 'Focus on today.',
    pt: 'Coloque a atenção no hoje.',
    es: 'Pon la atención en el hoy.',
  },
  participantCount: {
    zh: '今日已抽人数：{n}',
    en: 'Drawn today: {n}',
    pt: 'Tiraram hoje: {n}',
    es: 'Sacaron hoy: {n}',
  },
  attitudeGuideLabel: {
    zh: '行动指南',
    en: 'Action guide',
    pt: 'Guia de ação',
    es: 'Guía de acción',
  },
  start: {
    zh: '开始今日启示',
    en: "Start today's insight",
    pt: 'Iniciar revelação de hoje',
    es: 'Iniciar revelación de hoy',
  },
  preparing: {
    zh: 'Manto 正在为你准备今日问题…',
    en: 'Manto is preparing today’s questions…',
    pt: 'Manto está preparando as perguntas de hoje…',
    es: 'Manto está preparando las preguntas de hoy…',
  },
  preparingHint: {
    zh: 'AI 正在感知你的状态，请稍候',
    en: 'AI is sensing your state — please wait',
    pt: 'A IA está captando seu estado — aguarde',
    es: 'La IA está captando tu estado — espera',
  },
  drawing: {
    zh: '正在为你抽取今日主牌…',
    en: 'Drawing your card of the day…',
    pt: 'Tirando sua carta do dia…',
    es: 'Sacando tu carta del día…',
  },
  drawingHint: {
    zh: '牌阵能量汇聚中，马上揭晓',
    en: 'Energy gathering — reveal coming soon',
    pt: 'Energia se concentrando — revelação em breve',
    es: 'Energía concentrándose — revelación pronto',
  },
  cardRevealed: {
    zh: '今日主牌已翻开',
    en: 'Today’s card is revealed',
    pt: 'Carta do dia revelada',
    es: 'Carta del día revelada',
  },
  cardFlipping: {
    zh: '正在翻开今日主牌…',
    en: 'Revealing today’s card…',
    pt: 'Revelando carta do dia…',
    es: 'Revelando carta del día…',
  },
  briefTitle: { zh: '今日简报', en: "Today's brief", pt: 'Resumo de hoje', es: 'Resumen de hoy' },
  dimsTitle: {
    zh: '四维运势',
    en: 'Four dimensions',
    pt: 'Quatro dimensões',
    es: 'Cuatro dimensiones',
  },
  dimWork: { zh: '工作', en: 'Work', pt: 'Trabalho', es: 'Trabajo' },
  dimLove: { zh: '爱情', en: 'Love', pt: 'Amor', es: 'Amor' },
  dimCareer: { zh: '事业', en: 'Career', pt: 'Carreira', es: 'Carrera' },
  dimWealth: { zh: '财运', en: 'Wealth', pt: 'Riqueza', es: 'Riqueza' },
  loginDimsTitle: {
    zh: '登录查看四维运势',
    en: 'Sign in for full four-dimension reading',
    pt: 'Entre para ver as quatro dimensões',
    es: 'Inicia sesión para ver las cuatro dimensiones',
  },
  loginDimsMessage: {
    zh: '登录后可查看爱情、事业、财运等完整解读，并同步保存到用户中心。',
    en: 'Sign in to view love, career, wealth readings and sync to your profile.',
    pt: 'Entre para ver amor, carreira, riqueza e sincronizar no perfil.',
    es: 'Inicia sesión para ver amor, carrera, riqueza y sincronizar en tu perfil.',
  },
  loginDimsHint: {
    zh: '访客仍可查看今日简报；登录后记录会出现在 auth.orasage.com 的占卜历史中。',
    en: 'Guests still see today’s brief; signed-in readings appear in your history at auth.orasage.com.',
    pt: 'Visitantes veem o resumo; com login, o registro aparece em auth.orasage.com.',
    es: 'Los visitantes ven el resumen; con sesión, el registro aparece en auth.orasage.com.',
  },
  loginDimsCta: {
    zh: '登录查看完整报告',
    en: 'Sign in for full report',
    pt: 'Entrar para relatório completo',
    es: 'Iniciar sesión para informe completo',
  },
  recommendTitle: { zh: '今日推荐', en: "Today's pick", pt: 'Recomendação de hoje', es: 'Recomendación de hoy' },
  recommendCta: { zh: '去看看 →', en: 'View →', pt: 'Ver →', es: 'Ver →' },
  alreadyDrewToday: {
    zh: '你今天已经抽过每日运势了，以下是今日结果',
    en: 'You already drew your daily fortune today — here is your result',
    pt: 'Você já tirou a sorte diária hoje — este é o seu resultado',
    es: 'Ya sacaste tu fortuna diaria hoy — este es tu resultado',
  },
  exhaustedToday: {
    zh: '今日运势已抽取，明日再来',
    en: "Today's fortune is done — come back tomorrow",
    pt: 'Sorte de hoje concluída — volte amanhã',
    es: 'Fortuna de hoy lista — vuelve mañana',
  },
  drawFailed: {
    zh: '抽取失败',
    en: 'Draw failed',
    pt: 'Falha no sorteio',
    es: 'Error en la tirada',
  },
} as const satisfies Record<string, LangMap>;

const home = {
  greetingNight: {
    zh: '夜深了',
    en: 'Good evening',
    pt: 'Boa noite',
    es: 'Buenas noches',
  },
  greetingMorning: {
    zh: '早安',
    en: 'Good morning',
    pt: 'Bom dia',
    es: 'Buenos días',
  },
  greetingAfternoon: {
    zh: '午安',
    en: 'Good afternoon',
    pt: 'Boa tarde',
    es: 'Buenas tardes',
  },
  greetingEvening: {
    zh: '晚安',
    en: 'Good evening',
    pt: 'Boa noite',
    es: 'Buenas noches',
  },
  mentorFallback: {
    zh: 'Manto 为你守望着今日的星途',
    en: 'Manto is watching over your path today',
    pt: 'Manto vigia seu caminho hoje',
    es: 'Manto vigila tu camino hoy',
  },
  quotaTodayRemaining: {
    zh: '今日剩余 {n} 次',
    en: '{n} draws left today',
    pt: '{n} restantes hoje',
    es: '{n} restantes hoy',
  },
  quotaFreeToday: {
    zh: '今日 1 次免费',
    en: '1 free today',
    pt: '1 grátis hoje',
    es: '1 gratis hoy',
  },
  templeBonusAvailable: {
    zh: '祈福可 +1',
    en: 'Worship for +1',
    pt: 'Adorar +1',
    es: 'Adorar +1',
  },
  templeBonusGranted: {
    zh: '已获祈福加成',
    en: 'Temple bonus earned',
    pt: 'Bônus do templo',
    es: 'Bono del templo',
  },
  singleCardTitle: { zh: '定命切片', en: 'Destiny Slice', pt: 'Fatia do Destino', es: 'Fragmento del Destino' },
  singleCardDesc: {
    zh: '单点高能聚焦 · 滑动牌堆抽取倾向切片',
    en: 'Single-point focus · swipe the deck for tendency slices',
    pt: 'Foco de ponto único · deslize o baralho para fatias de tendência',
    es: 'Foco de punto único · desliza el mazo para fragmentos de tendencia',
  },
  singleCardCta: {
    zh: '进入定命切片 →',
    en: 'Enter Destiny Slice →',
    pt: 'Entrar na Fatia do Destino →',
    es: 'Entrar al Fragmento del Destino →',
  },
  singleCardUnlockBadge: {
    zh: '抽牌免费 · 解锁看切片',
    en: 'Free draw · unlock slice',
    pt: 'Tirada grátis · desbloqueie fatia',
    es: 'Tirada gratis · desbloquea fragmento',
  },
  singleCardUnlockedBadge: {
    zh: '已永久解锁',
    en: 'Unlocked forever',
    pt: 'Desbloqueado para sempre',
    es: 'Desbloqueado para siempre',
  },
  threeCardTitle: { zh: '脉络解构', en: 'Trilogy', pt: 'Trilogia', es: 'Trilogía' },
  threeCardDesc: {
    zh: '多维数据链条 · 因现果三帧切片推演',
    en: 'Multi-dimensional chain · past-present-future slices',
    pt: 'Cadeia multidimensional · fatias passado-presente-futuro',
    es: 'Cadena multidimensional · fragmentos pasado-presente-futuro',
  },
  dailyInsightTitle: { zh: '今日启示', en: "Today's insight", pt: 'Revelação de hoje', es: 'Revelación de hoy' },
  dailyInsightLine1: {
    zh: '每一天，都蕴含着不同的能量流动。',
    en: 'Every day carries its own flow of energy.',
    pt: 'Cada dia traz um fluxo diferente de energia.',
    es: 'Cada día trae un flujo distinto de energía.',
  },
  dailyInsightLine2: {
    zh: '将注意力放在今天，',
    en: 'Focus on today,',
    pt: 'Coloque a atenção no hoje,',
    es: 'Pon la atención en el hoy,',
  },
  dailyInsightLine3: {
    zh: '跟随直觉，抽取属于你的今日塔罗。',
    en: 'follow your intuition, and draw the tarot meant for you today.',
    pt: 'siga a intuição e tire o tarô que é seu hoje.',
    es: 'sigue la intuición y saca el tarot que te corresponde hoy.',
  },
  participantCount: {
    zh: '今日已抽人数：{n}',
    en: 'Drawn today: {n}',
    pt: 'Tiraram hoje: {n}',
    es: 'Sacaron hoy: {n}',
  },
  attitudeGuideLabel: {
    zh: '行动指南',
    en: 'Action guide',
    pt: 'Guia de ação',
    es: 'Guía de acción',
  },
  dailyInsightViewAgain: {
    zh: '查看今日启示 →',
    en: "View today's insight →",
    pt: 'Ver revelação de hoje →',
    es: 'Ver revelación de hoy →',
  },
  dailyCta: {
    zh: '抽取今日启示 →',
    en: "Draw today's insight →",
    pt: 'Tirar revelação de hoje →',
    es: 'Sacar revelación de hoy →',
  },
  threeCardNote: {
    zh: '深度报告与专属解读需登录后解锁',
    en: 'Full report and personal reading require sign-in',
    pt: 'Relatório completo exige login',
    es: 'Informe completo requiere inicio de sesión',
  },
  threeCardCta: {
    zh: '开始三牌占卜 →',
    en: 'Start three-card reading →',
    pt: 'Iniciar leitura de três cartas →',
    es: 'Iniciar lectura de tres cartas →',
  },
  templeTitle: {
    zh: '祈福',
    en: 'Blessing',
    pt: 'Bênção',
    es: 'Bendición',
  },
  templeDesc: {
    zh: '轻触神像完成今日参拜，可获得单牌阵额外抽取机会。',
    en: 'Tap the deity to worship today and earn an extra single-card draw.',
    pt: 'Toque a divindade para adorar hoje e ganhar um sorteio extra de carta única.',
    es: 'Toca la deidad para adorar hoy y gana una tirada extra de carta única.',
  },
  templeCta: {
    zh: '前往祈福 →',
    en: 'Go to blessing →',
    pt: 'Ir à bênção →',
    es: 'Ir a la bendición →',
  },
  heroEyebrow: {
    zh: '塔罗占卜',
    en: 'Tarot reading',
    pt: 'Leitura de tarô',
    es: 'Lectura de tarot',
  },
  heroHeadline: {
    zh: '翻一张牌，看看今天怎么走',
    en: 'Draw a card — see how today unfolds',
    pt: 'Tire uma carta — veja como o dia se desenrola',
    es: 'Saca una carta — mira cómo se desarrolla el día',
  },
  heroSubtitle: {
    zh: '每日运势与三牌占卜，都在这里开始',
    en: 'Daily fortune and three-card readings both start here',
    pt: 'A fortuna diária e a leitura de três cartas começam aqui',
    es: 'La fortuna diaria y la lectura de tres cartas empiezan aquí',
  },
} as const satisfies Record<string, LangMap>;

export type TarotHomeHeroFallback = {
  enabled: boolean;
  eyebrow: string;
  headline: string;
  subtitle: string;
  displayMode: 'text';
  videoAutoplay: boolean;
};

export function fallbackTarotHomeHeroContent(lang: Lang): TarotHomeHeroFallback {
  const p = (map: LangMap) => pick(map, lang);
  return {
    enabled: true,
    eyebrow: p(home.heroEyebrow),
    headline: p(home.heroHeadline),
    subtitle: p(home.heroSubtitle),
    displayMode: 'text',
    videoAutoplay: true,
  };
}

function homeGreeting(lang: Lang): string {
  const p = (map: LangMap) => pick(map, lang);
  const h = new Date().getHours();
  if (h < 6) return p(home.greetingNight);
  if (h < 12) return p(home.greetingMorning);
  if (h < 18) return p(home.greetingAfternoon);
  return p(home.greetingEvening);
}

export function useHomeCopy() {
  const { lang } = useLang();
  const daily = useDailyFortuneCopy();
  const three = useThreeCardCopy();
  const commonCopy = useReadingCommon();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      lang,
      greeting: () => homeGreeting(lang),
      mentorFallback: p(home.mentorFallback),
      traveler: commonCopy.traveler,
      dailyTitle: daily.label,
      dailyDesc: daily.dimsSubtitle,
      dailyCta: p(home.dailyCta),
      dailyInsightTitle: p(home.dailyInsightTitle),
      dailyInsightLines: [
        p(home.dailyInsightLine1),
        p(home.dailyInsightLine2),
        p(home.dailyInsightLine3),
      ],
      participantCount: (n: string) => formatTemplate(p(home.participantCount), { n }),
      attitudeGuideLabel: p(home.attitudeGuideLabel),
      dailyInsightViewAgain: p(home.dailyInsightViewAgain),
      quotaFreeToday: p(home.quotaFreeToday),
      quotaTodayRemaining: (n: number) => formatTemplate(p(home.quotaTodayRemaining), { n: String(n) }),
      templeBonusAvailable: p(home.templeBonusAvailable),
      templeBonusGranted: p(home.templeBonusGranted),
      singleCardTitle: p(home.singleCardTitle),
      singleCardDesc: p(home.singleCardDesc),
      singleCardCta: p(home.singleCardCta),
      singleCardUnlockBadge: p(home.singleCardUnlockBadge),
      singleCardUnlockedBadge: p(home.singleCardUnlockedBadge),
      threeCardTitle: p(home.threeCardTitle),
      threeCardDesc: p(home.threeCardDesc),
      threeCardNote: p(home.threeCardNote),
      threeCardCta: p(home.threeCardCta),
      templeTitle: p(home.templeTitle),
      templeDesc: p(home.templeDesc),
      templeCta: p(home.templeCta),
      heroEyebrow: p(home.heroEyebrow),
      heroHeadline: p(home.heroHeadline),
      heroSubtitle: p(home.heroSubtitle),
    };
  }, [lang, daily, three, commonCopy]);
}

const history = {
  label: { zh: 'ARCHIVE', en: 'ARCHIVE', pt: 'ARCHIVE', es: 'ARCHIVE' },
  title: { zh: '历史记录', en: 'History', pt: 'Histórico', es: 'Historial' },
  subtitle: {
    zh: '回顾你的占卜档案',
    en: 'Review your reading archive',
    pt: 'Revise seu arquivo de leituras',
    es: 'Revisa tu archivo de lecturas',
  },
  tabReading: { zh: '牌阵占卜', en: 'Spread readings', pt: 'Leituras em spread', es: 'Lecturas en spread' },
  tabDaily: { zh: '每日抽卡', en: 'Daily draws', pt: 'Cartas diárias', es: 'Cartas diarias' },
  tabWish: { zh: '心愿占卜', en: 'Wish readings', pt: 'Desejos', es: 'Deseos' },
  empty: { zh: '暂无记录', en: 'No records yet', pt: 'Sem registros', es: 'Sin registros' },
  emptyHint: {
    zh: '开始你的第一次占卜吧',
    en: 'Start your first reading',
    pt: 'Comece sua primeira leitura',
    es: 'Empieza tu primera lectura',
  },
  defaultQuestion: { zh: '占卜', en: 'Reading', pt: 'Leitura', es: 'Lectura' },
  crystalRec: {
    zh: '推荐水晶：{name}',
    en: 'Recommended crystal: {name}',
    pt: 'Cristal recomendado: {name}',
    es: 'Cristal recomendado: {name}',
  },
  wishLabel: { zh: '心愿占卜', en: 'Wish reading', pt: 'Leitura de desejo', es: 'Lectura de deseo' },
  redirecting: {
    zh: '正在跳转到用户中心…',
    en: 'Redirecting to profile…',
    pt: 'Redirecionando ao perfil…',
    es: 'Redirigiendo al perfil…',
  },
} as const satisfies Record<string, LangMap>;

function formatTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

export function positionLabel(lang: Lang, key: string): string {
  const map = positions[key as PositionKey];
  return map ? pick(map, lang) : key;
}

export function positionSublabel(lang: Lang, key: string): string {
  const map = positionSublabels[key as PositionKey];
  return map ? pick(map, lang) : '';
}

export function orientationLabel(lang: Lang, orientation: '正位' | '逆位' | string): string {
  if (orientation === '正位') return pick(common.upright, lang);
  if (orientation === '逆位') return pick(common.reversed, lang);
  return orientation;
}

export function formatHistoryDate(lang: Lang, iso: string): string {
  const d = new Date(iso);
  if (lang === 'en') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (lang === 'pt') {
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }
  if (lang === 'es') {
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function useReadingCommon() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      lang,
      p,
      loadFailed: p(common.loadFailed),
      questionsFailed: p(common.questionsFailed),
      checkoutFailed: p(common.checkoutFailed),
      redirecting: p(common.redirecting),
      backHome: p(common.backHome),
      synthesis: p(common.synthesis),
      traveler: p(common.traveler),
      loginDefaultTitle: p(common.loginDefaultTitle),
      loginDefaultCta: p(common.loginDefaultCta),
      questionProgress: (current: number, total: number) =>
        formatTemplate(p(common.questionProgress), { current: String(current), total: String(total) }),
      position: (key: string) => positionLabel(lang, key),
      positionSublabel: (key: string) => positionSublabel(lang, key),
      orientation: (o: string) => orientationLabel(lang, o),
      nicknameGreeting: (nickname?: string | null) => {
        if (!nickname || nickname === p(common.traveler)) return '';
        if (lang === 'zh') return `${nickname}，`;
        return `${nickname}, `;
      },
    };
  }, [lang]);
}

export function useThreeCardCopy() {
  const { lang } = useLang();
  const commonCopy = useReadingCommon();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      ...commonCopy,
      label: p(threeCard.label),
      title: p(threeCard.title),
      statusBadge: p(threeCard.statusBadge),
      subtitle: p(threeCard.subtitle),
      introLead: p(threeCard.introLead),
      questionLabel: p(threeCard.questionLabel),
      questionPlaceholder: p(threeCard.questionPlaceholder),
      start: p(threeCard.start),
      sensing: p(threeCard.sensing),
      sensingHint: p(threeCard.sensingHint),
      drawing: p(threeCard.drawing),
      drawingHint: p(threeCard.drawingHint),
      tapReveal: (n: number) => formatTemplate(p(threeCard.tapReveal), { n: String(n) }),
      briefGenerating: p(threeCard.briefGenerating),
      allRevealed: p(threeCard.allRevealed),
      writingBrief: p(threeCard.writingBrief),
      writingBriefHint: p(threeCard.writingBriefHint),
      freeBrief: p(threeCard.freeBrief),
      unlockLead: p(threeCard.unlockLead),
      loginUnlock: p(threeCard.loginUnlock),
      viewPlans: p(threeCard.viewPlans),
      paywallTitle: p(threeCard.paywallTitle),
      paywallMessage: p(threeCard.paywallMessage),
      paywallHint: p(threeCard.paywallHint),
      paywallCta: p(threeCard.paywallCta),
      tier1Title: p(threeCard.tier1Title),
      tier1Fallback: p(threeCard.tier1Fallback),
      buyReport: p(threeCard.buyReport),
      tier2Title: p(threeCard.tier2Title),
      tier2Fallback: p(threeCard.tier2Fallback),
      buyBundle: p(threeCard.buyBundle),
      paidView: p(threeCard.paidView),
      backBrief: p(threeCard.backBrief),
      sectionArchitecture: p(threeCard.sectionArchitecture),
      modeLabel: p(threeCard.modeLabel),
      sectionNodes: p(threeCard.sectionNodes),
      sectionChain: p(threeCard.sectionChain),
      sectionThreshold: p(threeCard.sectionThreshold),
      fullSynthesis: p(threeCard.fullSynthesis),
      suggestions: p(threeCard.suggestions),
      bundleNote: p(threeCard.bundleNote),
      viewOrders: p(threeCard.viewOrders),
      again: p(threeCard.again),
      drawFailed: p(threeCard.drawFailed),
      briefFailed: p(threeCard.briefFailed),
      fullFailed: p(threeCard.fullFailed),
      loginBeforeBuy: p(threeCard.loginBeforeBuy),
    };
  }, [lang, commonCopy]);
}

export function useDailyFortuneCopy() {
  const { lang } = useLang();
  const commonCopy = useReadingCommon();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    const dimLabel = (key: DailyFortuneFullReportKeys) => {
      const map = {
        work: dailyFortune.dimWork,
        love: dailyFortune.dimLove,
        career: dailyFortune.dimCareer,
        wealth: dailyFortune.dimWealth,
        summary: common.synthesis,
      }[key];
      return p(map);
    };
    return {
      ...commonCopy,
      label: p(dailyFortune.label),
      title: p(dailyFortune.title),
      dimsSubtitle: p(dailyFortune.dimsSubtitle),
      quotaAllowance: p(dailyFortune.quotaAllowance),
      quotaRemaining: p(dailyFortune.quotaRemaining),
      times: (n: number) => formatTemplate(p(dailyFortune.times), { n: String(n) }),
      introLead: p(dailyFortune.introLead),
      introTitle: p(dailyFortune.introTitle),
      introSubtitle: p(dailyFortune.introSubtitle),
      tapToDraw: p(dailyFortune.tapToDraw),
      introCalmLines: [p(dailyFortune.introCalm1), p(dailyFortune.introCalm2)],
      participantCount: (n: string) => formatTemplate(p(dailyFortune.participantCount), { n }),
      attitudeGuideLabel: p(dailyFortune.attitudeGuideLabel),
      start: p(dailyFortune.start),
      preparing: p(dailyFortune.preparing),
      preparingHint: p(dailyFortune.preparingHint),
      drawing: p(dailyFortune.drawing),
      drawingHint: p(dailyFortune.drawingHint),
      cardRevealed: p(dailyFortune.cardRevealed),
      cardFlipping: p(dailyFortune.cardFlipping),
      briefTitle: p(dailyFortune.briefTitle),
      dimsTitle: p(dailyFortune.dimsTitle),
      dimLabel,
      loginDimsTitle: p(dailyFortune.loginDimsTitle),
      loginDimsMessage: p(dailyFortune.loginDimsMessage),
      loginDimsHint: p(dailyFortune.loginDimsHint),
      loginDimsCta: p(dailyFortune.loginDimsCta),
      recommendTitle: p(dailyFortune.recommendTitle),
      recommendCta: p(dailyFortune.recommendCta),
      alreadyDrewToday: p(dailyFortune.alreadyDrewToday),
      exhaustedToday: p(dailyFortune.exhaustedToday),
      drawFailed: p(dailyFortune.drawFailed),
    };
  }, [lang, commonCopy]);
}

export function useSingleCardCopy() {
  const { lang } = useLang();
  const commonCopy = useReadingCommon();
  const three = useThreeCardCopy();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      ...commonCopy,
      ...three,
      label: p(singleCard.label),
      title: p(singleCard.title),
      statusBadge: p(singleCard.statusBadge),
      subtitle: p(singleCard.subtitle),
      introLead: p(singleCard.introLead),
      questionLabel: p(singleCard.questionLabel),
      questionPlaceholder: p(singleCard.questionPlaceholder),
      deckHint: p(singleCard.deckHint),
      pickCard: p(singleCard.pickCard),
      drawing: p(singleCard.drawing),
      drawingHint: p(singleCard.drawingHint),
      cardRevealed: p(singleCard.cardRevealed),
      cardFlipping: p(singleCard.cardFlipping),
      writingGuidance: p(singleCard.writingGuidance),
      writingGuidanceHint: p(singleCard.writingGuidanceHint),
      drawAgain: p(singleCard.drawAgain),
      drawFailed: p(singleCard.drawFailed),
      guidanceFailed: p(singleCard.guidanceFailed),
      sectionTendency: p(singleCard.sectionTendency),
      coreTendencyLabel: p(singleCard.coreTendencyLabel),
      energyProbabilityLabel: p(singleCard.energyProbabilityLabel),
      sectionDeconstruction: p(singleCard.sectionDeconstruction),
      sectionThreshold: p(singleCard.sectionThreshold),
      paywallTitle: p(singleCard.paywallTitle),
      paywallDesc: p(singleCard.paywallDesc),
      paywallMessage: p(singleCard.paywallMessage),
      paywallHint: p(singleCard.paywallHint),
      paywallCta: p(singleCard.paywallCta),
      paywallFallback: p(singleCard.paywallFallback),
      buyUnlock: p(singleCard.buyUnlock),
      unlockForever: p(singleCard.unlockForever),
      resultLockedHint: p(singleCard.resultLockedHint),
      loginBeforeBuy: p(singleCard.loginBeforeBuy),
    };
  }, [lang, commonCopy, three]);
}

type DailyFortuneFullReportKeys = 'work' | 'love' | 'career' | 'wealth' | 'summary';

export function useHistoryCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      lang,
      label: p(history.label),
      title: p(history.title),
      subtitle: p(history.subtitle),
      tabs: [
        { key: 'reading' as const, label: p(history.tabReading) },
        { key: 'daily-card' as const, label: p(history.tabDaily) },
        { key: 'wish' as const, label: p(history.tabWish) },
      ],
      empty: p(history.empty),
      emptyHint: p(history.emptyHint),
      defaultQuestion: p(history.defaultQuestion),
      crystalRec: (name: string) => formatTemplate(p(history.crystalRec), { name }),
      wishLabel: p(history.wishLabel),
      redirecting: p(history.redirecting),
      formatDate: (iso: string) => formatHistoryDate(lang, iso),
    };
  }, [lang]);
}
