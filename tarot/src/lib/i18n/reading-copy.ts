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

const threeCard = {
  label: { zh: '三牌阵', en: 'Three-card spread', pt: 'Três cartas', es: 'Tres cartas' },
  title: {
    zh: '过去 · 现在 · 未来',
    en: 'Past · Present · Future',
    pt: 'Passado · Presente · Futuro',
    es: 'Pasado · Presente · Futuro',
  },
  subtitle: {
    zh: '简读免费，完整详读需解锁',
    en: 'Brief reading is free; full report unlocks separately',
    pt: 'Leitura breve grátis; relatório completo é pago',
    es: 'Lectura breve gratis; informe completo de pago',
  },
  introLead: {
    zh: '写下你想问的事（可留空做一般指引）。Manto 会先问你几个小问题，再为你翻开三张牌。',
    en: 'Write your question (or leave blank for general guidance). Manto will ask a few questions, then reveal three cards.',
    pt: 'Escreva sua pergunta (ou deixe em branco). Manto fará algumas perguntas e revelará três cartas.',
    es: 'Escribe tu pregunta (o déjala en blanco). Manto hará unas preguntas y revelará tres cartas.',
  },
  questionLabel: { zh: '你的问题', en: 'Your question', pt: 'Sua pergunta', es: 'Tu pregunta' },
  questionPlaceholder: {
    zh: '例如：这段感情会走向哪里？',
    en: 'e.g. Where is this relationship heading?',
    pt: 'ex.: Para onde vai este relacionamento?',
    es: 'p. ej. ¿Hacia dónde va esta relación?',
  },
  start: {
    zh: '开始三牌占卜',
    en: 'Start three-card reading',
    pt: 'Iniciar leitura de três cartas',
    es: 'Iniciar lectura de tres cartas',
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
    zh: '正在为你抽取三牌阵…',
    en: 'Drawing your three-card spread…',
    pt: 'Tirando suas três cartas…',
    es: 'Sacando tus tres cartas…',
  },
  drawingHint: {
    zh: '过去 · 现在 · 未来，牌阵成形中',
    en: 'Past · Present · Future — the spread is forming',
    pt: 'Passado · Presente · Futuro — o spread se forma',
    es: 'Pasado · Presente · Futuro — el spread se forma',
  },
  tapReveal: {
    zh: '轻触翻开第 {n} 张牌',
    en: 'Tap to reveal card {n}',
    pt: 'Toque para revelar a carta {n}',
    es: 'Toca para revelar la carta {n}',
  },
  briefGenerating: {
    zh: '正在生成简读…',
    en: 'Generating brief reading…',
    pt: 'Gerando leitura breve…',
    es: 'Generando lectura breve…',
  },
  allRevealed: {
    zh: '三张牌已全部翻开',
    en: 'All three cards are revealed',
    pt: 'As três cartas foram reveladas',
    es: 'Las tres cartas están reveladas',
  },
  writingBrief: {
    zh: 'Manto 正在撰写简读…',
    en: 'Manto is writing your brief reading…',
    pt: 'Manto está escrevendo sua leitura breve…',
    es: 'Manto está escribiendo tu lectura breve…',
  },
  writingBriefHint: {
    zh: '结合你的回答与牌面，生成解读中',
    en: 'Combining your answers and the cards',
    pt: 'Combinando suas respostas e as cartas',
    es: 'Combinando tus respuestas y las cartas',
  },
  freeBrief: { zh: '免费简读', en: 'Free brief', pt: 'Leitura breve grátis', es: 'Lectura breve gratis' },
  unlockLead: {
    zh: '完整详读包含逐牌深度解读、行动建议与肯定语，登录后可购买解锁并保存到用户中心。',
    en: 'The full report includes deep per-card analysis, action steps, and affirmations. Sign in to purchase and save to your profile.',
    pt: 'O relatório completo inclui análise profunda, ações e afirmações. Entre para comprar e salvar no perfil.',
    es: 'El informe completo incluye análisis profundo, acciones y afirmaciones. Inicia sesión para comprar y guardar en tu perfil.',
  },
  loginUnlock: {
    zh: '登录解锁完整报告',
    en: 'Sign in to unlock full report',
    pt: 'Entrar para desbloquear relatório',
    es: 'Inicia sesión para desbloquear informe',
  },
  viewPlans: {
    zh: '查看完整报告方案',
    en: 'View full report options',
    pt: 'Ver opções de relatório',
    es: 'Ver opciones de informe',
  },
  paywallTitle: {
    zh: '登录后购买完整报告',
    en: 'Sign in to purchase full report',
    pt: 'Entre para comprar o relatório',
    es: 'Inicia sesión para comprar el informe',
  },
  paywallMessage: {
    zh: '访客可免费完成问答、抽牌与简读。完整详读与支付需先登录账号。',
    en: 'Guests can complete Q&A, draw cards, and read the brief for free. Full report and payment require an account.',
    pt: 'Visitantes podem concluir perguntas, tirar cartas e ver a leitura breve grátis. Relatório completo exige conta.',
    es: 'Los visitantes pueden completar preguntas, sacar cartas y leer el resumen gratis. El informe completo requiere cuenta.',
  },
  paywallHint: {
    zh: '登录后将自动回到本页，已抽的牌与简读不会丢失。',
    en: 'After sign-in you will return here; cards and brief reading are kept.',
    pt: 'Após entrar você volta aqui; cartas e leitura breve são mantidas.',
    es: 'Tras iniciar sesión volverás aquí; cartas y lectura breve se conservan.',
  },
  paywallCta: { zh: '去登录', en: 'Sign in', pt: 'Entrar', es: 'Iniciar sesión' },
  tier1Title: {
    zh: '方案一 · 完整报告',
    en: 'Option 1 · Full report',
    pt: 'Opção 1 · Relatório completo',
    es: 'Opción 1 · Informe completo',
  },
  tier1Fallback: {
    zh: '三牌阵完整详读报告',
    en: 'Full three-card reading report',
    pt: 'Relatório completo de três cartas',
    es: 'Informe completo de tres cartas',
  },
  buyReport: {
    zh: '购买完整报告',
    en: 'Purchase full report',
    pt: 'Comprar relatório completo',
    es: 'Comprar informe completo',
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
    zh: '我已付款，查看完整报告',
    en: 'I paid — view full report',
    pt: 'Já paguei — ver relatório',
    es: 'Ya pagué — ver informe',
  },
  backBrief: { zh: '返回简读', en: 'Back to brief', pt: 'Voltar à leitura breve', es: 'Volver al resumen' },
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
    zh: '站在十字路口，抽一张牌',
    en: 'At the crossroads, draw one card',
    pt: 'Na encruzilhada, tire uma carta',
    es: 'En la encrucijada, saca una carta',
  },
  subtitle: {
    zh: '心中默念你的问题，从牌堆抽出一张，获得简洁的行动指引',
    en: 'Hold your question in mind, draw one card, and receive concise action guidance',
    pt: 'Mentalize sua pergunta, tire uma carta e receba orientação de ação',
    es: 'Mentaliza tu pregunta, saca una carta y recibe una guía de acción',
  },
  introLead: {
    zh: '心中默念你的问题，从下方牌堆凭直觉点选一张。',
    en: 'Hold your question silently in mind, then tap one card from the deck below.',
    pt: 'Mentalize sua pergunta em silêncio e toque uma carta do baralho abaixo.',
    es: 'Mentaliza tu pregunta en silencio y toca una carta del mazo de abajo.',
  },
  deckHint: {
    zh: '心中默念问题，点选一张牌',
    en: 'Hold your question in mind and tap a card',
    pt: 'Mentalize a pergunta e toque uma carta',
    es: 'Mentaliza la pregunta y toca una carta',
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
    zh: '正在生成行动指引…',
    en: 'Generating action guidance…',
    pt: 'Gerando orientação de ação…',
    es: 'Generando guía de acción…',
  },
  writingGuidanceHint: {
    zh: '结合抽到的牌面，给出简洁建议',
    en: 'Drawing on the card you chose',
    pt: 'Com base na carta escolhida',
    es: 'Basado en la carta que sacaste',
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
  actionLabel: { zh: '行动指引', en: 'Action guidance', pt: 'Orientação de ação', es: 'Guía de acción' },
  insightTitle: { zh: '牌意解读', en: 'Card insight', pt: 'Leitura da carta', es: 'Lectura de la carta' },
  legacyAction: {
    zh: '牌面指引',
    en: 'Card guidance',
    pt: 'Orientação da carta',
    es: 'Guía de la carta',
  },
  paywallTitle: {
    zh: '解锁行动指引',
    en: 'Unlock action guidance',
    pt: 'Desbloquear orientação de ação',
    es: 'Desbloquear guía de acción',
  },
  paywallDesc: {
    zh: '牌已抽出。付费一次永久解锁，即可查看本次及今后每一次的行动指引。',
    en: 'Your card is drawn. Pay once to permanently unlock action guidance for this and every future reading.',
    pt: 'Sua carta foi tirada. Pague uma vez para desbloquear permanentemente a orientação desta e de futuras leituras.',
    es: 'Tu carta está sacada. Paga una vez para desbloquear permanentemente la guía de esta y futuras lecturas.',
  },
  paywallMessage: {
    zh: '查看行动指引需登录 orasage 账号后购买，解锁后永久可用。',
    en: 'Viewing guidance requires an orasage account. Unlock once, use forever.',
    pt: 'Ver a orientação exige conta orasage. Desbloqueie uma vez, use para sempre.',
    es: 'Ver la guía requiere cuenta orasage. Desbloquea una vez, usa para siempre.',
  },
  paywallHint: {
    zh: '抽牌免费；登录后可付费解锁查看指引',
    en: 'Drawing is free; sign in to unlock guidance',
    pt: 'Tirar carta é grátis; entre para desbloquear a orientação',
    es: 'Sacar carta es gratis; inicia sesión para desbloquear la guía',
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
    zh: '付费查看指引',
    en: 'Unlock guidance',
    pt: 'Desbloquear orientação',
    es: 'Desbloquear guía',
  },
  unlockForever: {
    zh: '一次付费，永久解锁所有行动指引',
    en: 'Pay once — unlock all action guidance forever',
    pt: 'Pague uma vez — desbloqueie toda orientação para sempre',
    es: 'Paga una vez — desbloquea toda la guía para siempre',
  },
  resultLockedHint: {
    zh: '行动指引已就绪，解锁后即可查看',
    en: 'Your guidance is ready — unlock to view',
    pt: 'Sua orientação está pronta — desbloqueie para ver',
    es: 'Tu guía está lista — desbloquea para ver',
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
    zh: '心中默念问题 · 从牌堆抽一张得行动指引',
    en: 'Hold your question in mind · draw for action guidance',
    pt: 'Mentalize a pergunta · tire uma carta para orientação',
    es: 'Mentaliza la pregunta · saca una carta para guía',
  },
  singleCardCta: {
    zh: '进入定命切片 →',
    en: 'Enter Destiny Slice →',
    pt: 'Entrar na Fatia do Destino →',
    es: 'Entrar al Fragmento del Destino →',
  },
  singleCardUnlockBadge: {
    zh: '抽牌免费 · 解锁看指引',
    en: 'Free draw · unlock guidance',
    pt: 'Tirada grátis · desbloqueie orientação',
    es: 'Tirada gratis · desbloquea guía',
  },
  singleCardUnlockedBadge: {
    zh: '已永久解锁',
    en: 'Unlocked forever',
    pt: 'Desbloqueado para sempre',
    es: 'Desbloqueado para siempre',
  },
  threeCardTitle: { zh: '三牌占卜', en: 'Three-card reading', pt: 'Leitura de três cartas', es: 'Lectura de tres cartas' },
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
    zh: '今日启示、单牌占卜与三牌占卜，从这里开始',
    en: "Today's insight, single-card and three-card readings start here",
    pt: 'Revelação de hoje, carta única e três cartas começam aqui',
    es: 'Revelación de hoy, carta única y tres cartas empiezan aquí',
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
      threeCardDesc: three.subtitle,
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
      subtitle: p(singleCard.subtitle),
      introLead: p(singleCard.introLead),
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
      actionLabel: p(singleCard.actionLabel),
      insightTitle: p(singleCard.insightTitle),
      legacyAction: p(singleCard.legacyAction),
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
