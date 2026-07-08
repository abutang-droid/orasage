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

const dailyFortune = {
  label: { zh: '每日运势', en: 'Daily fortune', pt: 'Sorte diária', es: 'Fortuna diaria' },
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
    zh: 'Manto 会先问你几个小问题，再为你翻开今日主牌，并生成四维运势解读。',
    en: 'Manto will ask a few questions, reveal your card of the day, and generate a four-dimension reading.',
    pt: 'Manto fará algumas perguntas, revelará sua carta do dia e gerará a leitura em quatro dimensões.',
    es: 'Manto hará unas preguntas, revelará tu carta del día y generará la lectura en cuatro dimensiones.',
  },
  start: {
    zh: '开始今日运势',
    en: "Start today's reading",
    pt: 'Iniciar leitura de hoje',
    es: 'Iniciar lectura de hoy',
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
  drawAgain: {
    zh: '再抽一次（剩余 {n} 次）',
    en: 'Draw again ({n} left)',
    pt: 'Tirar de novo ({n} restantes)',
    es: 'Sacar de nuevo ({n} restantes)',
  },
  paywallTitle: {
    zh: '今日次数已用完',
    en: "Today's draws are used up",
    pt: 'Sorteios de hoje esgotados',
    es: 'Tiradas de hoy agotadas',
  },
  paywallDesc: {
    zh: '每日免费 1 次，神庙祈福可额外 +1 次。如需继续抽取，可购买额外次数。',
    en: '1 free draw daily; temple worship grants +1. Purchase extra draws to continue.',
    pt: '1 sorteio grátis por dia; templo concede +1. Compre sorteios extras para continuar.',
    es: '1 tirada gratis al día; el templo otorga +1. Compra tiradas extra para continuar.',
  },
  templeBonus: {
    zh: '去神庙祈福 +1',
    en: 'Worship at temple for +1',
    pt: 'Adorar no templo +1',
    es: 'Adorar en el templo +1',
  },
  buyExtra: {
    zh: '购买额外抽取',
    en: 'Buy extra draws',
    pt: 'Comprar sorteios extras',
    es: 'Comprar tiradas extra',
  },
  drawFailed: {
    zh: '抽取失败',
    en: 'Draw failed',
    pt: 'Falha no sorteio',
    es: 'Error en la tirada',
  },
} as const satisfies Record<string, LangMap>;

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
      drawAgain: (n: number) => formatTemplate(p(dailyFortune.drawAgain), { n: String(n) }),
      paywallTitle: p(dailyFortune.paywallTitle),
      paywallDesc: p(dailyFortune.paywallDesc),
      templeBonus: p(dailyFortune.templeBonus),
      buyExtra: p(dailyFortune.buyExtra),
      drawFailed: p(dailyFortune.drawFailed),
    };
  }, [lang, commonCopy]);
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
