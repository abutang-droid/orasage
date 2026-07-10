import { useMemo } from 'react';
import type { Lang } from './context';
import { useLang } from './context';
import type { LangMap } from './ui-strings';
import { pick } from './ui-strings';
import type { GenderOption, OccupationOption, OnboardingPrefill } from '@/lib/onboarding-v2';
import { GENDER_OPTIONS, OCCUPATION_OPTIONS } from '@/lib/onboarding-v2';
import { formatFaithLabel } from '@/lib/faiths/religions';

export const GENDER_KEYS = [...GENDER_OPTIONS] as const;
export const OCCUPATION_KEYS = [...OCCUPATION_OPTIONS] as const;
export const DREAM_EMOTION_KEYS = ['平静', '喜悦', '焦虑', '悲伤', '困惑'] as const;
export type DreamEmotionKey = (typeof DREAM_EMOTION_KEYS)[number];

const genderLabels: Record<GenderOption, LangMap> = {
  女: { zh: '女', en: 'Female', pt: 'Feminino', es: 'Femenino' },
  男: { zh: '男', en: 'Male', pt: 'Masculino', es: 'Masculino' },
  非二元: { zh: '非二元', en: 'Non-binary', pt: 'Não-binário', es: 'No binario' },
  不想说: { zh: '不想说', en: 'Prefer not to say', pt: 'Prefiro não dizer', es: 'Prefiero no decir' },
};

const occupationLabels: Record<OccupationOption, LangMap> = {
  工作: { zh: '工作', en: 'Employed', pt: 'Empregado', es: 'Empleado' },
  待业: { zh: '待业', en: 'Unemployed', pt: 'Desempregado', es: 'Desempleado' },
  学生: { zh: '学生', en: 'Student', pt: 'Estudante', es: 'Estudiante' },
  自由职业: { zh: '自由职业', en: 'Freelance', pt: 'Autônomo', es: 'Autónomo' },
};

const dreamEmotions: Record<
  DreamEmotionKey,
  { label: LangMap; emoji: string; color: string }
> = {
  平静: {
    label: { zh: '平静', en: 'Calm', pt: 'Calma', es: 'Calma' },
    emoji: '😌',
    color: '#5B7FA6',
  },
  喜悦: {
    label: { zh: '喜悦', en: 'Joy', pt: 'Alegria', es: 'Alegría' },
    emoji: '😊',
    color: '#F5C842',
  },
  焦虑: {
    label: { zh: '焦虑', en: 'Anxiety', pt: 'Ansiedade', es: 'Ansiedad' },
    emoji: '😰',
    color: '#E8783A',
  },
  悲伤: {
    label: { zh: '悲伤', en: 'Sadness', pt: 'Tristeza', es: 'Tristeza' },
    emoji: '😢',
    color: '#7E9BAF',
  },
  困惑: {
    label: { zh: '困惑', en: 'Confusion', pt: 'Confusão', es: 'Confusión' },
    emoji: '😕',
    color: '#9B8E82',
  },
};

const sourceApps: Record<string, LangMap> = {
  bazi: { zh: '八字', en: 'BaZi', pt: 'BaZi', es: 'BaZi' },
  ziwei: { zh: '紫微', en: 'Zi Wei', pt: 'Zi Wei', es: 'Zi Wei' },
  tarot: { zh: '塔罗', en: 'Tarot', pt: 'Tarô', es: 'Tarot' },
};

export function sourceAppLabel(lang: Lang, app: string | null | undefined): string | null {
  if (!app) return null;
  const map = sourceApps[app];
  return map ? pick(map, lang) : app;
}

const onboarding = {
  mentorAlt: {
    zh: 'Manto，你的塔罗引导者',
    en: 'Manto, your tarot guide',
    pt: 'Manto, seu guia de tarô',
    es: 'Manto, tu guía de tarot',
  },
  mentorRole: {
    zh: '你的塔罗引导者',
    en: 'Your tarot guide',
    pt: 'Seu guia de tarô',
    es: 'Tu guía de tarot',
  },
  introDefault: {
    zh: '你好，我是 Manto，你的塔罗引导者。\n\n在翻开第一张牌之前，我想先认识你一点点——不会很久，就像老朋友聊天那样。',
    en: "Hi, I'm Manto, your tarot guide.\n\nBefore we draw the first card, I'd love to know you a little — just a short chat, like old friends.",
    pt: 'Olá, sou Manto, seu guia de tarô.\n\nAntes da primeira carta, quero conhecer você um pouco — um papo rápido, como velhos amigos.',
    es: 'Hola, soy Manto, tu guía de tarot.\n\nAntes de la primera carta, quiero conocerte un poco — una charla breve, como viejos amigos.',
  },
  introExternal: {
    zh: '你好，我是 Manto，你的塔罗引导者。\n\n我注意到你曾在【{source}】留下过足迹。接下来我会先确认你的基本信息，好让之后的运势与占卜更贴近你。',
    en: "Hi, I'm Manto, your tarot guide.\n\nI see you've been active on [{source}]. I'll confirm your basics so readings fit you better.",
    pt: 'Olá, sou Manto, seu guia de tarô.\n\nVi que você esteve em [{source}]. Vou confirmar seus dados para leituras mais personalizadas.',
    es: 'Hola, soy Manto, tu guía de tarot.\n\nVeo que estuviste en [{source}]. Confirmaré tus datos para lecturas más personalizadas.',
  },
  askNickname: {
    zh: '首先，我该怎么称呼你？',
    en: 'First, what should I call you?',
    pt: 'Primeiro, como devo te chamar?',
    es: 'Primero, ¿cómo debo llamarte?',
  },
  nicknamePlaceholder: {
    zh: '你的昵称',
    en: 'Your nickname',
    pt: 'Seu apelido',
    es: 'Tu apodo',
  },
  continue: { zh: '继续', en: 'Continue', pt: 'Continuar', es: 'Continuar' },
  start: { zh: '开始吧', en: "Let's begin", pt: 'Começar', es: 'Empezar' },
  prefillConfirm: {
    zh: '这是我目前了解到的你，确认一下好吗？',
    en: "Here's what I know about you so far — does this look right?",
    pt: 'Isto é o que sei sobre você até agora — está correto?',
    es: 'Esto es lo que sé de ti hasta ahora — ¿es correcto?',
  },
  confirmContinue: {
    zh: '确认，继续',
    en: 'Confirm and continue',
    pt: 'Confirmar e continuar',
    es: 'Confirmar y continuar',
  },
  editPrefill: {
    zh: '我要修改',
    en: 'I want to edit',
    pt: 'Quero editar',
    es: 'Quiero editar',
  },
  prefillOk: {
    zh: '信息没错，继续吧',
    en: 'Looks good, continue',
    pt: 'Está certo, continuar',
    es: 'Correcto, continuar',
  },
  editMyself: {
    zh: '我想自己填写',
    en: "I'll fill it in myself",
    pt: 'Prefiro preencher eu mesmo',
    es: 'Prefiero completarlo yo',
  },
  askBirthday: {
    zh: '很高兴认识你。你的生日是哪一天？我会据此调整运势解读的语气与节奏。',
    en: "Nice to meet you. What's your birthday? It helps tune the tone of your readings.",
    pt: 'Prazer em conhecer. Qual sua data de nascimento? Isso ajuda a calibrar suas leituras.',
    es: 'Encantado. ¿Cuál es tu fecha de nacimiento? Ayuda a calibrar tus lecturas.',
  },
  askBirthdayShort: {
    zh: '还差生日这一项——你的出生日期是？',
    en: 'We still need your birthday — when were you born?',
    pt: 'Falta seu aniversário — qual a data de nascimento?',
    es: 'Falta tu cumpleaños — ¿cuál es tu fecha de nacimiento?',
  },
  askGender: {
    zh: '收到。那你的性别认同是？',
    en: 'Got it. How do you identify?',
    pt: 'Entendido. Como você se identifica?',
    es: 'Entendido. ¿Cómo te identificas?',
  },
  askGenderPrefill: {
    zh: '那告诉我你的性别认同，我会用更合适的称呼与你对话。',
    en: 'Tell me your gender identity so I can address you appropriately.',
    pt: 'Conte sua identidade de gênero para eu me dirigir a você adequadamente.',
    es: 'Cuéntame tu identidad de género para dirigirme a ti adecuadamente.',
  },
  askOccupation: {
    zh: '你现在的工作状态是？',
    en: "What's your current work situation?",
    pt: 'Qual sua situação profissional atual?',
    es: '¿Cuál es tu situación laboral actual?',
  },
  askOccupationDetail: {
    zh: '你现在的工作状态是？这会影响事业与财运的解读角度。',
    en: 'Your work situation shapes career and wealth readings — what is it?',
    pt: 'Sua situação profissional afeta leituras de carreira e finanças — qual é?',
    es: 'Tu situación laboral afecta lecturas de carrera y finanzas — ¿cuál es?',
  },
  askGeo: {
    zh: '最后，确认你所在的国家，并选择一种精神归属。我们会自动尝试定位，你也可以手动选择。祈福与运势都会参考它。',
    en: 'Lastly, confirm your country and spiritual path. We can auto-detect or you can pick manually.',
    pt: 'Por fim, confirme seu país e caminho espiritual. Detectamos automaticamente ou você escolhe.',
    es: 'Por último, confirma tu país y camino espiritual. Podemos detectar o puedes elegir.',
  },
  askGeoShort: {
    zh: '最后一步——确认你的国家，并选择信仰或精神归属。',
    en: 'Final step — confirm your country and faith or spiritual path.',
    pt: 'Último passo — confirme país e fé ou caminho espiritual.',
    es: 'Último paso — confirma país y fe o camino espiritual.',
  },
  editFromBirthday: {
    zh: '没问题，我们从生日开始。',
    en: "No problem — let's start with your birthday.",
    pt: 'Sem problema — vamos começar pelo aniversário.',
    es: 'Sin problema — empecemos por tu cumpleaños.',
  },
  saving: {
    zh: '很好，我正在为你铺好今日的星途……',
    en: "Great — I'm preparing today's path for you…",
    pt: 'Ótimo — estou preparando seu caminho de hoje…',
    es: 'Genial — estoy preparando tu camino de hoy…',
  },
  savingBtn: {
    zh: '正在保存…',
    en: 'Saving…',
    pt: 'Salvando…',
    es: 'Guardando…',
  },
  done: { zh: '完成', en: 'Done', pt: 'Concluir', es: 'Listo' },
  saveFailed: {
    zh: '保存失败',
    en: 'Save failed',
    pt: 'Falha ao salvar',
    es: 'Error al guardar',
  },
  faithConfirm: {
    zh: '确认并完成引导',
    en: 'Confirm and finish',
    pt: 'Confirmar e concluir',
    es: 'Confirmar y terminar',
  },
  prefillBirthday: {
    zh: '生日：{value}',
    en: 'Birthday: {value}',
    pt: 'Aniversário: {value}',
    es: 'Cumpleaños: {value}',
  },
  prefillGender: {
    zh: '性别：{value}',
    en: 'Gender: {value}',
    pt: 'Gênero: {value}',
    es: 'Género: {value}',
  },
  prefillOccupation: {
    zh: '工作状态：{value}',
    en: 'Work: {value}',
    pt: 'Trabalho: {value}',
    es: 'Trabajo: {value}',
  },
  prefillFaith: {
    zh: '信仰：{value}',
    en: 'Faith: {value}',
    pt: 'Fé: {value}',
    es: 'Fe: {value}',
  },
  prefillCountry: {
    zh: '国家/地区：{value}',
    en: 'Country/region: {value}',
    pt: 'País/região: {value}',
    es: 'País/región: {value}',
  },
  prefillSource: {
    zh: '来源：{value} 档案',
    en: 'From: {value} profile',
    pt: 'Origem: perfil {value}',
    es: 'Origen: perfil {value}',
  },
} as const satisfies Record<string, LangMap>;

const dream = {
  title: { zh: '梦境解析', en: 'Dream interpretation', pt: 'Interpretação de sonhos', es: 'Interpretación de sueños' },
  subtitle: {
    zh: 'Dream Interpretation · 潜意识探索',
    en: 'Dream Interpretation · Subconscious exploration',
    pt: 'Dream Interpretation · Exploração do subconsciente',
    es: 'Dream Interpretation · Exploración del subconsciente',
  },
  introTitle: {
    zh: '梦境是潜意识的语言',
    en: 'Dreams are the language of the subconscious',
    pt: 'Sonhos são a linguagem do subconsciente',
    es: 'Los sueños son el lenguaje del subconsciente',
  },
  introBody: {
    zh: '每一个梦境都包含着你内心深处的信息。通过解析梦境中的符号，我们可以了解你的潜意识正在处理什么，以及它想告诉你什么。',
    en: 'Every dream carries messages from within. By reading its symbols, we see what your subconscious is processing — and what it wants to tell you.',
    pt: 'Cada sonho traz mensagens internas. Ao ler seus símbolos, vemos o que seu subconsciente processa — e o que quer dizer.',
    es: 'Cada sueño trae mensajes internos. Al leer sus símbolos, vemos qué procesa tu subconsciente — y qué quiere decirte.',
  },
  describeLabel: {
    zh: '🌙 描述你的梦境',
    en: '🌙 Describe your dream',
    pt: '🌙 Descreva seu sonho',
    es: '🌙 Describe tu sueño',
  },
  placeholder: {
    zh: '尽量详细地描述你梦见了什么...\n\n例如：梦见了什么人、什么地方、发生了什么事、有什么感受...',
    en: 'Describe your dream in detail...\n\nWho, where, what happened, how you felt...',
    pt: 'Descreva seu sonho em detalhes...\n\nQuem, onde, o que aconteceu, como se sentiu...',
    es: 'Describe tu sueño con detalle...\n\nQuién, dónde, qué pasó, cómo te sentiste...',
  },
  charCount: {
    zh: '{n} 字',
    en: '{n} chars',
    pt: '{n} caracteres',
    es: '{n} caracteres',
  },
  emotionLabel: {
    zh: '💭 梦中的情绪感受（可选）',
    en: '💭 Dream emotions (optional)',
    pt: '💭 Emoções no sonho (opcional)',
    es: '💭 Emociones en el sueño (opcional)',
  },
  examplesLabel: {
    zh: '💡 示例梦境（点击填入）：',
    en: '💡 Example dreams (tap to fill):',
    pt: '💡 Sonhos de exemplo (toque para preencher):',
    es: '💡 Sueños de ejemplo (toca para rellenar):',
  },
  analyze: {
    zh: '🔮 解析我的梦境',
    en: '🔮 Interpret my dream',
    pt: '🔮 Interpretar meu sonho',
    es: '🔮 Interpretar mi sueño',
  },
  analyzingTitle: {
    zh: '正在解析你的梦境...',
    en: 'Interpreting your dream...',
    pt: 'Interpretando seu sonho...',
    es: 'Interpretando tu sueño...',
  },
  analyzingHint: {
    zh: '潜意识的语言正在被翻译\n请稍候片刻',
    en: 'Translating the language of the subconscious\nPlease wait a moment',
    pt: 'Traduzindo a linguagem do subconsciente\nAguarde um momento',
    es: 'Traduciendo el lenguaje del subconsciente\nEspera un momento',
  },
  emotionResult: {
    zh: '梦境情绪',
    en: 'Dream emotion',
    pt: 'Emoção do sonho',
    es: 'Emoción del sueño',
  },
  symbolsCount: {
    zh: '识别符号',
    en: 'Symbols found',
    pt: 'Símbolos encontrados',
    es: 'Símbolos encontrados',
  },
  symbolsUnit: {
    zh: '{n} 个',
    en: '{n}',
    pt: '{n}',
    es: '{n}',
  },
  symbolsTitle: {
    zh: '🔍 梦境符号解析',
    en: '🔍 Dream symbols',
    pt: '🔍 Símbolos do sonho',
    es: '🔍 Símbolos del sueño',
  },
  synthesisTitle: {
    zh: '🔮 梦境综合解析',
    en: '🔮 Overall interpretation',
    pt: '🔮 Interpretação geral',
    es: '🔮 Interpretación general',
  },
  subconsciousTitle: {
    zh: '💭 潜意识的信息',
    en: '💭 Subconscious message',
    pt: '💭 Mensagem do subconsciente',
    es: '💭 Mensaje del subconsciente',
  },
  suggestionTitle: {
    zh: '🌱 行动建议',
    en: '🌱 Action suggestion',
    pt: '🌱 Sugestão de ação',
    es: '🌱 Sugerencia de acción',
  },
  newDream: {
    zh: '🌙 解析新梦境',
    en: '🌙 New dream',
    pt: '🌙 Novo sonho',
    es: '🌙 Nuevo sueño',
  },
  viewHistory: {
    zh: '📖 查看历史',
    en: '📖 View history',
    pt: '📖 Ver histórico',
    es: '📖 Ver historial',
  },
  disclaimer: {
    zh: '梦境解析基于荣格心理学和符号学理论，\n仅供参考，不构成心理诊断或医疗建议。',
    en: 'Dream interpretation draws on Jungian psychology and symbolism.\nFor reflection only — not diagnosis or medical advice.',
    pt: 'A interpretação usa psicologia junguiana e simbolismo.\nApenas reflexão — não é diagnóstico ou conselho médico.',
    es: 'La interpretación usa psicología junguiana y simbolismo.\nSolo reflexión — no es diagnóstico ni consejo médico.',
  },
  minLength: {
    zh: '请至少描述5个字的梦境内容',
    en: 'Please describe at least 5 characters',
    pt: 'Descreva pelo menos 5 caracteres',
    es: 'Describe al menos 5 caracteres',
  },
  parseFailed: {
    zh: '解析失败，请重试',
    en: 'Interpretation failed, please retry',
    pt: 'Falha na interpretação, tente novamente',
    es: 'Error en la interpretación, inténtalo de nuevo',
  },
  networkError: {
    zh: '网络错误，请重试',
    en: 'Network error, please retry',
    pt: 'Erro de rede, tente novamente',
    es: 'Error de red, inténtalo de nuevo',
  },
  examples: [
    {
      zh: '我梦见自己在飞翔，飞过一片广阔的大海，感觉非常自由...',
      en: 'I dreamed I was flying over a vast ocean, feeling completely free...',
      pt: 'Sonhei que voava sobre um oceano imenso, sentindo total liberdade...',
      es: 'Soñé que volaba sobre un océano inmenso, sintiendo total libertad...',
    },
    {
      zh: '我梦见一条大蛇追着我跑，我很害怕，拼命逃跑...',
      en: 'I dreamed a large snake chased me — I was terrified and ran...',
      pt: 'Sonhei que uma cobra grande me perseguia — fiquei apavorado e corri...',
      es: 'Soñé que una serpiente grande me perseguía — tuve miedo y corrí...',
    },
    {
      zh: '我梦见自己在一个陌生的房子里迷路，找不到出口...',
      en: 'I dreamed I was lost in a strange house with no exit...',
      pt: 'Sonhei que estava perdido numa casa estranha sem saída...',
      es: 'Soñé que estaba perdido en una casa extraña sin salida...',
    },
    {
      zh: '我梦见和已故的亲人在一起，他们看起来很平静...',
      en: 'I dreamed of departed loved ones — they looked peaceful...',
      pt: 'Sonhei com entes queridos falecidos — pareciam em paz...',
      es: 'Soñé con seres queridos fallecidos — parecían en paz...',
    },
  ] as const satisfies ReadonlyArray<LangMap>,
} as const;

const angel = {
  title: { zh: '天使牌', en: 'Angel cards', pt: 'Cartas angelicais', es: 'Cartas angélicas' },
  subtitle: {
    zh: 'Angel Cards · 神圣指引',
    en: 'Angel Cards · Sacred guidance',
    pt: 'Angel Cards · Orientação sagrada',
    es: 'Angel Cards · Guía sagrada',
  },
  introTitle: {
    zh: '天使牌指引',
    en: 'Angel card guidance',
    pt: 'Orientação das cartas angelicais',
    es: 'Guía de cartas angélicas',
  },
  introBody: {
    zh: '天使牌来自西方神秘学传统，每一张牌都承载着天使的讯息与智慧。无论你正在经历什么，天使都在你身旁，等待为你指引方向。',
    en: 'Angel cards come from Western mysticism — each carries angelic wisdom. Whatever you face, angels are near, ready to guide you.',
    pt: 'As cartas angelicais vêm da mística ocidental — cada uma traz sabedoria angelical. O que quer que enfrente, os anjos estão perto.',
    es: 'Las cartas angélicas vienen de la mística occidental — cada una trae sabiduría angelical. Pase lo que pase, los ángeles están cerca.',
  },
  features: [
    {
      title: { zh: '44张天使牌', en: '44 angel cards', pt: '44 cartas', es: '44 cartas' },
      desc: {
        zh: '大天使 · 守护天使 · 元素天使',
        en: 'Archangels · guardians · elementals',
        pt: 'Arcanjos · guardiões · elementais',
        es: 'Arcángeles · guardianes · elementales',
      },
    },
    {
      title: { zh: '意图占卜', en: 'Intention reading', pt: 'Leitura com intenção', es: 'Lectura con intención' },
      desc: {
        zh: '带着问题，获得专属指引',
        en: 'Bring a question, receive guidance',
        pt: 'Traga uma pergunta, receba orientação',
        es: 'Trae una pregunta, recibe guía',
      },
    },
    {
      title: { zh: '正念肯定语', en: 'Affirmations', pt: 'Afirmações', es: 'Afirmaciones' },
      desc: {
        zh: '每日一句，滋养内心力量',
        en: 'Daily words to nourish your spirit',
        pt: 'Palavras diárias para nutrir o espírito',
        es: 'Palabras diarias para nutrir el espíritu',
      },
    },
    {
      title: { zh: '行动指引', en: 'Action guidance', pt: 'Orientação prática', es: 'Guía de acción' },
      desc: {
        zh: '具体建议，落地实践',
        en: 'Concrete steps you can take',
        pt: 'Passos concretos para agir',
        es: 'Pasos concretos para actuar',
      },
    },
  ] as const,
  start: {
    zh: '✨ 开始天使牌占卜',
    en: '✨ Start angel card reading',
    pt: '✨ Iniciar leitura angelical',
    es: '✨ Iniciar lectura angélica',
  },
  intentionTitle: {
    zh: '🙏 设定你的意图',
    en: '🙏 Set your intention',
    pt: '🙏 Defina sua intenção',
    es: '🙏 Define tu intención',
  },
  intentionLead: {
    zh: '在抽卡之前，你可以在心中设定一个意图或问题，\n天使会为你带来最适合的指引。',
    en: 'Before drawing, set an intention or question in your heart.\nThe angels will bring the guidance you need.',
    pt: 'Antes de tirar, defina uma intenção ou pergunta no coração.\nOs anjos trarão a orientação certa.',
    es: 'Antes de sacar, define una intención o pregunta en tu corazón.\nLos ángeles traerán la guía adecuada.',
  },
  intentionPlaceholder: {
    zh: '例如：我在感情上需要什么指引？\n或者：我的事业下一步该怎么走？\n\n也可以留空，接受天使的随机指引。',
    en: 'e.g. What guidance do I need in love?\nOr: What is my next career step?\n\nLeave blank for a spontaneous message.',
    pt: 'ex.: Que orientação preciso no amor?\nOu: Qual o próximo passo na carreira?\n\nDeixe em branco para uma mensagem espontânea.',
    es: 'p. ej. ¿Qué guía necesito en el amor?\nO: ¿Cuál es mi siguiente paso profesional?\n\nDéjalo en blanco para un mensaje espontáneo.',
  },
  back: { zh: '返回', en: 'Back', pt: 'Voltar', es: 'Volver' },
  draw: {
    zh: '🌟 抽取天使牌',
    en: '🌟 Draw angel card',
    pt: '🌟 Tirar carta angelical',
    es: '🌟 Sacar carta angélica',
  },
  quickIntentionsLabel: {
    zh: '快捷意图：',
    en: 'Quick intentions:',
    pt: 'Intenções rápidas:',
    es: 'Intenciones rápidas:',
  },
  drawingTitle: {
    zh: '天使正在为你选择...',
    en: 'The angels are choosing for you...',
    pt: 'Os anjos estão escolhendo para você...',
    es: 'Los ángeles están eligiendo para ti...',
  },
  drawingHint: {
    zh: '请保持内心平静，感受天使的存在',
    en: 'Stay calm and feel the angels near you',
    pt: 'Mantenha a calma e sinta os anjos perto',
    es: 'Mantén la calma y siente a los ángeles cerca',
  },
  affirmationLabel: {
    zh: '✨ 今日肯定语',
    en: "✨ Today's affirmation",
    pt: '✨ Afirmação de hoje',
    es: '✨ Afirmación de hoy',
  },
  messageLabel: {
    zh: '💌 天使的讯息',
    en: "💌 Angel's message",
    pt: '💌 Mensagem do anjo',
    es: '💌 Mensaje del ángel',
  },
  guidanceLabel: {
    zh: '🌱 行动指引',
    en: '🌱 Action guidance',
    pt: '🌱 Orientação prática',
    es: '🌱 Guía de acción',
  },
  keywordsLabel: {
    zh: '🏷️ 关键词',
    en: '🏷️ Keywords',
    pt: '🏷️ Palavras-chave',
    es: '🏷️ Palabras clave',
  },
  save: { zh: '💾 保存记录', en: '💾 Save', pt: '💾 Salvar', es: '💾 Guardar' },
  saved: { zh: '✅ 已保存', en: '✅ Saved', pt: '✅ Salvo', es: '✅ Guardado' },
  again: { zh: '🔄 再次占卜', en: '🔄 Read again', pt: '🔄 Ler de novo', es: '🔄 Leer de nuevo' },
  footerHint: {
    zh: '💡 天使牌的指引是一种内在智慧的镜子，\n最终的选择和行动权永远在你自己手中。',
    en: '💡 Angel cards mirror your inner wisdom —\nthe final choice and action are always yours.',
    pt: '💡 As cartas refletem sua sabedoria interior —\na escolha final é sempre sua.',
    es: '💡 Las cartas reflejan tu sabiduría interior —\nla elección final siempre es tuya.',
  },
  elementFire: { zh: '火元素', en: 'Fire', pt: 'Fogo', es: 'Fuego' },
  elementWater: { zh: '水元素', en: 'Water', pt: 'Água', es: 'Agua' },
  elementEarth: { zh: '土元素', en: 'Earth', pt: 'Terra', es: 'Tierra' },
  elementAir: { zh: '风元素', en: 'Air', pt: 'Ar', es: 'Aire' },
  elementLight: { zh: '光元素', en: 'Light', pt: 'Luz', es: 'Luz' },
} as const;

const angelQuickIntentions: Record<string, LangMap> = {
  感情指引: { zh: '感情指引', en: 'Love guidance', pt: 'Amor', es: 'Amor' },
  事业方向: { zh: '事业方向', en: 'Career direction', pt: 'Carreira', es: 'Carrera' },
  健康提示: { zh: '健康提示', en: 'Health insight', pt: 'Saúde', es: 'Salud' },
  财运建议: { zh: '财运建议', en: 'Wealth advice', pt: 'Finanças', es: 'Finanzas' },
  今日指引: { zh: '今日指引', en: "Today's guidance", pt: 'Guia de hoje', es: 'Guía de hoy' },
  内心成长: { zh: '内心成长', en: 'Inner growth', pt: 'Crescimento interior', es: 'Crecimiento interior' },
};

function formatTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

export function genderLabel(lang: Lang, key: GenderOption | string): string {
  const map = genderLabels[key as GenderOption];
  return map ? pick(map, lang) : key;
}

export function occupationLabel(lang: Lang, key: OccupationOption | string): string {
  const map = occupationLabels[key as OccupationOption];
  return map ? pick(map, lang) : key;
}

export function dreamEmotionLabel(lang: Lang, key: string): string {
  const row = dreamEmotions[key as DreamEmotionKey];
  return row ? pick(row.label, lang) : key;
}

export function angelElementLabel(lang: Lang, element: string): string {
  const map: Record<string, LangMap> = {
    fire: angel.elementFire,
    water: angel.elementWater,
    earth: angel.elementEarth,
    air: angel.elementAir,
    light: angel.elementLight,
  };
  return pick(map[element] ?? angel.elementLight, lang);
}

export function formatPrefillSummaryLocalized(lang: Lang, prefill: OnboardingPrefill): string {
  const p = (map: LangMap, value: string) => formatTemplate(pick(map, lang), { value });
  const rows: string[] = [];
  if (prefill.birthdate) rows.push(p(onboarding.prefillBirthday, prefill.birthdate));
  if (prefill.gender) rows.push(p(onboarding.prefillGender, genderLabel(lang, prefill.gender)));
  if (prefill.occupation)
    rows.push(p(onboarding.prefillOccupation, occupationLabel(lang, prefill.occupation)));
  if (prefill.faith) rows.push(p(onboarding.prefillFaith, formatFaithLabel(prefill.faith, undefined, lang)));
  if (prefill.countryCode) rows.push(p(onboarding.prefillCountry, prefill.countryCode));
  if (prefill.sourceApp) rows.push(p(onboarding.prefillSource, sourceAppLabel(lang, prefill.sourceApp) ?? prefill.sourceApp));
  else if (prefill.sourceLabel) rows.push(p(onboarding.prefillSource, prefill.sourceLabel));
  return rows.join('\n');
}

export function useOnboardingCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      lang,
      p,
      mentorAlt: p(onboarding.mentorAlt),
      mentorRole: p(onboarding.mentorRole),
      introText: (sourceLabel?: string | null) =>
        sourceLabel
          ? formatTemplate(p(onboarding.introExternal), { source: sourceLabel })
          : p(onboarding.introDefault),
      askNickname: p(onboarding.askNickname),
      nicknamePlaceholder: p(onboarding.nicknamePlaceholder),
      continue: p(onboarding.continue),
      start: p(onboarding.start),
      prefillConfirm: p(onboarding.prefillConfirm),
      confirmContinue: p(onboarding.confirmContinue),
      editPrefill: p(onboarding.editPrefill),
      prefillOk: p(onboarding.prefillOk),
      editMyself: p(onboarding.editMyself),
      askBirthday: p(onboarding.askBirthday),
      askBirthdayShort: p(onboarding.askBirthdayShort),
      askGender: p(onboarding.askGender),
      askGenderPrefill: p(onboarding.askGenderPrefill),
      askOccupation: p(onboarding.askOccupation),
      askOccupationDetail: p(onboarding.askOccupationDetail),
      askGeo: p(onboarding.askGeo),
      askGeoShort: p(onboarding.askGeoShort),
      editFromBirthday: p(onboarding.editFromBirthday),
      saving: p(onboarding.saving),
      savingBtn: p(onboarding.savingBtn),
      done: p(onboarding.done),
      saveFailed: p(onboarding.saveFailed),
      faithConfirm: p(onboarding.faithConfirm),
      genderOptions: GENDER_KEYS.map((key) => ({
        key,
        label: genderLabel(lang, key),
      })),
      occupationOptions: OCCUPATION_KEYS.map((key) => ({
        key,
        label: occupationLabel(lang, key),
      })),
      formatPrefillSummary: (prefill: OnboardingPrefill) =>
        formatPrefillSummaryLocalized(lang, prefill),
      sourceAppLabel: (app: string | null | undefined) => sourceAppLabel(lang, app),
      genderLabel: (key: GenderOption | string) => genderLabel(lang, key),
      occupationLabel: (key: OccupationOption | string) => occupationLabel(lang, key),
    };
  }, [lang]);
}

export function useDreamCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      lang,
      title: p(dream.title),
      subtitle: p(dream.subtitle),
      introTitle: p(dream.introTitle),
      introBody: p(dream.introBody),
      describeLabel: p(dream.describeLabel),
      placeholder: p(dream.placeholder),
      charCount: (n: number) => formatTemplate(p(dream.charCount), { n: String(n) }),
      emotionLabel: p(dream.emotionLabel),
      examplesLabel: p(dream.examplesLabel),
      analyze: p(dream.analyze),
      analyzingTitle: p(dream.analyzingTitle),
      analyzingHint: p(dream.analyzingHint),
      emotionResult: p(dream.emotionResult),
      symbolsCount: p(dream.symbolsCount),
      symbolsUnit: (n: number) => formatTemplate(p(dream.symbolsUnit), { n: String(n) }),
      symbolsTitle: p(dream.symbolsTitle),
      synthesisTitle: p(dream.synthesisTitle),
      subconsciousTitle: p(dream.subconsciousTitle),
      suggestionTitle: p(dream.suggestionTitle),
      newDream: p(dream.newDream),
      viewHistory: p(dream.viewHistory),
      disclaimer: p(dream.disclaimer),
      minLength: p(dream.minLength),
      parseFailed: p(dream.parseFailed),
      networkError: p(dream.networkError),
      emotions: DREAM_EMOTION_KEYS.map((key) => ({
        id: key,
        label: dreamEmotionLabel(lang, key),
        emoji: dreamEmotions[key].emoji,
        color: dreamEmotions[key].color,
      })),
      examples: dream.examples.map((row) => p(row)),
      emotionLabelFor: (key: string) => dreamEmotionLabel(lang, key),
    };
  }, [lang]);
}

export function useAngelCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
    return {
      lang,
      title: p(angel.title),
      subtitle: p(angel.subtitle),
      introTitle: p(angel.introTitle),
      introBody: p(angel.introBody),
      features: angel.features.map((f) => ({
        title: p(f.title),
        desc: p(f.desc),
      })),
      featureIcons: ['💫', '🙏', '✨', '📖'] as const,
      start: p(angel.start),
      intentionTitle: p(angel.intentionTitle),
      intentionLead: p(angel.intentionLead),
      intentionPlaceholder: p(angel.intentionPlaceholder),
      back: p(angel.back),
      draw: p(angel.draw),
      quickIntentionsLabel: p(angel.quickIntentionsLabel),
      quickIntentions: Object.entries(angelQuickIntentions).map(([key, map]) => ({
        key,
        label: p(map),
      })),
      drawingTitle: p(angel.drawingTitle),
      drawingHint: p(angel.drawingHint),
      affirmationLabel: p(angel.affirmationLabel),
      messageLabel: p(angel.messageLabel),
      guidanceLabel: p(angel.guidanceLabel),
      keywordsLabel: p(angel.keywordsLabel),
      save: p(angel.save),
      saved: p(angel.saved),
      again: p(angel.again),
      footerHint: p(angel.footerHint),
      elementLabel: (element: string) => angelElementLabel(lang, element),
      cardDisplayName: (name: string, nameEn: string) =>
        lang === 'zh' ? name : nameEn || name,
    };
  }, [lang]);
}
