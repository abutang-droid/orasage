import type { Lang } from '@/lib/i18n/context';
import type { LangMap } from '@/lib/i18n/ui-strings';
import { pick } from '@/lib/i18n/ui-strings';

export type KnowledgeTip = {
  title: LangMap;
  content: LangMap;
};

export const KNOWLEDGE_TIPS: KnowledgeTip[] = [
  {
    title: {
      zh: '愚者的真正含义',
      en: 'What the Fool really means',
      pt: 'O verdadeiro significado do Louco',
      es: 'El verdadero significado del Loco',
    },
    content: {
      zh: '愚者不是愚蠢，而是代表无限可能的开始。这张牌提醒你：有时候，勇气比经验更重要。',
      en: 'The Fool is not foolishness — it marks a beginning of infinite possibility. Sometimes courage matters more than experience.',
      pt: 'O Louco não é tolice — marca um começo de possibilidades infinitas. Às vezes a coragem importa mais que a experiência.',
      es: 'El Loco no es necedad — marca un inicio de posibilidades infinitas. A veces el coraje importa más que la experiencia.',
    },
  },
  {
    title: {
      zh: '为什么牌要分正逆位',
      en: 'Why cards have upright and reversed meanings',
      pt: 'Por que as cartas têm posições normal e invertida',
      es: 'Por qué las cartas tienen posiciones derecha e invertida',
    },
    content: {
      zh: '正位代表能量的自然流动，逆位则表示能量受阻或需要转换视角。同一张牌的正逆解读可能截然不同。',
      en: 'Upright shows energy flowing naturally; reversed suggests blockage or a need to shift perspective. The same card can read very differently.',
      pt: 'A posição normal mostra energia fluindo; a invertida sugere bloqueio ou mudança de perspectiva. A mesma carta pode ler-se de modo bem diferente.',
      es: 'La posición derecha muestra energía en flujo; la invertida sugiere bloqueo o cambio de perspectiva. La misma carta puede leerse muy distinto.',
    },
  },
  {
    title: {
      zh: '大阿卡纳 vs 小阿卡纳',
      en: 'Major Arcana vs Minor Arcana',
      pt: 'Arcanos Maiores vs Menores',
      es: 'Arcanos Mayores vs Menores',
    },
    content: {
      zh: '大阿卡纳22张讲述灵魂的成长旅程，小阿卡纳56张描绘日常生活的具体场景。两者缺一不可。',
      en: 'The 22 Major Arcana trace the soul’s journey; the 56 Minor Arcana mirror everyday life. You need both.',
      pt: 'Os 22 Arcanos Maiores traçam a jornada da alma; os 56 Menores espelham o dia a dia. Você precisa dos dois.',
      es: 'Los 22 Arcanos Mayores trazan el viaje del alma; los 56 Menores reflejan la vida cotidiana. Necesitas ambos.',
    },
  },
  {
    title: {
      zh: '塔罗四元素',
      en: 'The four elements in tarot',
      pt: 'Os quatro elementos no tarô',
      es: 'Los cuatro elementos en el tarot',
    },
    content: {
      zh: '权杖火、圣杯水、宝剑风、星币土，四元素平衡才是最佳状态。缺少任何一种都需要留意。',
      en: 'Wands are fire, Cups water, Swords air, Pentacles earth. Balance across all four is ideal — notice what is missing.',
      pt: 'Paus são fogo, Copas água, Espadas ar, Ouros terra. O equilíbrio entre os quatro é ideal — note o que falta.',
      es: 'Bastos son fuego, Copas agua, Espadas aire, Oros tierra. El equilibrio entre los cuatro es ideal — nota lo que falta.',
    },
  },
  {
    title: {
      zh: '什么是牌阵',
      en: 'What is a spread?',
      pt: 'O que é um spread?',
      es: '¿Qué es una tirada?',
    },
    content: {
      zh: '牌阵是塔罗解读的框架，不同的阵型适合不同的问题。三牌阵最通用，凯尔特十字最全面。',
      en: 'A spread is the layout that frames a reading. Different spreads suit different questions — three cards are versatile; the Celtic Cross is comprehensive.',
      pt: 'Um spread é o layout que estrutura a leitura. Três cartas são versáteis; a Cruz Celta é abrangente.',
      es: 'Una tirada es el diseño que enmarca la lectura. Tres cartas son versátiles; la Cruz Celta es completa.',
    },
  },
  {
    title: {
      zh: '如何提升直觉力',
      en: 'How to strengthen intuition',
      pt: 'Como fortalecer a intuição',
      es: 'Cómo fortalecer la intuición',
    },
    content: {
      zh: '每天抽一张牌，不看书先自己感受画面传达的信息。直觉像肌肉，越用越强。',
      en: 'Draw one card daily and sit with the image before reading the book. Intuition is a muscle — the more you use it, the stronger it gets.',
      pt: 'Tire uma carta por dia e sinta a imagem antes de ler o livro. A intuição é um músculo — quanto mais usa, mais forte fica.',
      es: 'Saca una carta al día y siente la imagen antes de leer el libro. La intuición es un músculo — cuanto más la usas, más fuerte queda.',
    },
  },
  {
    title: {
      zh: '塔罗不是算命',
      en: 'Tarot is not fortune-telling',
      pt: 'Tarô não é adivinhação',
      es: 'El tarot no es adivinación',
    },
    content: {
      zh: '塔罗是自我觉察的工具，它展示当下的能量状态，而不是注定的命运。你的选择永远可以改变走向。',
      en: 'Tarot is a tool for self-awareness. It reflects present energy, not fixed fate. Your choices can always change the path.',
      pt: 'O tarô é uma ferramenta de autoconhecimento. Reflete a energia presente, não um destino fixo. Suas escolhas sempre podem mudar o caminho.',
      es: 'El tarot es una herramienta de autoconocimiento. Refleja la energía presente, no un destino fijo. Tus elecciones siempre pueden cambiar el camino.',
    },
  },
  {
    title: {
      zh: '抽牌的最佳时间',
      en: 'Best time to draw cards',
      pt: 'Melhor hora para tirar cartas',
      es: 'Mejor momento para sacar cartas',
    },
    content: {
      zh: '清晨刚醒或睡前冥想时最适合抽牌，此时潜意识最活跃，连接更清晰。',
      en: 'Early morning or bedtime meditation are ideal — the subconscious is most open then.',
      pt: 'Manhã cedo ou meditação antes de dormir são ideais — o subconsciente está mais aberto.',
      es: 'Temprano por la mañana o meditación antes de dormir son ideales — el subconsciente está más abierto.',
    },
  },
  {
    title: {
      zh: '逆位一定是坏的吗',
      en: 'Is reversed always bad?',
      pt: 'Invertida é sempre ruim?',
      es: '¿Invertida siempre es mala?',
    },
    content: {
      zh: '不一定。逆位有时代表能量内收、需要暂停，或是提醒你换一个角度看问题。',
      en: 'Not necessarily. Reversed can mean inward energy, a pause, or a prompt to see things differently.',
      pt: 'Nem sempre. Invertida pode significar energia interna, pausa ou ver as coisas de outro ângulo.',
      es: 'No necesariamente. Invertida puede significar energía interna, pausa o ver las cosas de otro ángulo.',
    },
  },
  {
    title: {
      zh: '如何保管塔罗牌',
      en: 'How to care for your deck',
      pt: 'Como cuidar do seu baralho',
      es: 'Cómo cuidar tu mazo',
    },
    content: {
      zh: '用丝绸或棉布包裹，放在安静干净的地方。塔罗牌是你的工具，尊重它但不需过度迷信。',
      en: 'Wrap your deck in cloth and keep it in a calm, clean place. Respect the tool without superstition.',
      pt: 'Envolva o baralho em tecido e guarde em um lugar calmo e limpo. Respeite a ferramenta sem superstição.',
      es: 'Envuelve el mazo en tela y guárdalo en un lugar tranquilo y limpio. Respeta la herramienta sin superstición.',
    },
  },
  {
    title: {
      zh: '同一个问题能反复问吗',
      en: 'Can you ask the same question again?',
      pt: 'Pode perguntar a mesma coisa de novo?',
      es: '¿Puedes preguntar lo mismo otra vez?',
    },
    content: {
      zh: '不建议。反复问同一问题会让人陷入焦虑循环。一周后再问一次更合适。',
      en: 'It is better not to. Repeating the same question feeds anxiety loops. Waiting a week is wiser.',
      pt: 'É melhor não repetir. A mesma pergunta em loop alimenta ansiedade. Espere uma semana.',
      es: 'Mejor no repetir. La misma pregunta en bucle alimenta la ansiedad. Espera una semana.',
    },
  },
  {
    title: {
      zh: '死神牌不可怕',
      en: 'Death is not scary',
      pt: 'A Morte não assusta',
      es: 'La Muerte no da miedo',
    },
    content: {
      zh: '死神代表结束和转变，不是真正的死亡。抽到死神恭喜你，旧的不去新的不来。',
      en: 'Death marks endings and transformation — not literal death. It clears space for what comes next.',
      pt: 'A Morte marca finais e transformação — não morte literal. Abre espaço para o que vem depois.',
      es: 'La Muerte marca finales y transformación — no muerte literal. Abre espacio para lo que sigue.',
    },
  },
  {
    title: {
      zh: '塔罗中的数字含义',
      en: 'Number meanings in tarot',
      pt: 'Significados dos números no tarô',
      es: 'Significados de los números en el tarot',
    },
    content: {
      zh: 'Ace是种子，2是选择，3是成果，4是稳定，5是冲突，6是恢复，7是考验，8是速度，9是完成前，10是圆满或过载。',
      en: 'Ace is seed, 2 choice, 3 fruition, 4 stability, 5 conflict, 6 recovery, 7 test, 8 momentum, 9 near-completion, 10 fullness or overload.',
      pt: 'Ás é semente, 2 escolha, 3 fruição, 4 estabilidade, 5 conflito, 6 recuperação, 7 teste, 8 impulso, 9 quase completo, 10 plenitude ou excesso.',
      es: 'As es semilla, 2 elección, 3 fruto, 4 estabilidad, 5 conflicto, 6 recuperación, 7 prueba, 8 impulso, 9 casi completo, 10 plenitud o exceso.',
    },
  },
  {
    title: {
      zh: '宫廷牌代表什么',
      en: 'What court cards represent',
      pt: 'O que representam as cartas da corte',
      es: 'Qué representan las cartas de la corte',
    },
    content: {
      zh: '侍从代表学习和消息，骑士代表行动和追求，皇后代表滋养和包容，国王代表掌控和权威。',
      en: 'Pages learn and deliver messages; Knights act and pursue; Queens nurture; Kings lead and hold authority.',
      pt: 'Pajens aprendem e trazem mensagens; Cavaleiros agem; Rainhas nutrem; Reis lideram.',
      es: 'Pajes aprenden y traen mensajes; Caballeros actúan; Reinas nutren; Reyes lideran.',
    },
  },
  {
    title: {
      zh: '星座与塔罗',
      en: 'Zodiac and tarot',
      pt: 'Zodíaco e tarô',
      es: 'Zodíaco y tarot',
    },
    content: {
      zh: '每张大阿卡纳都有对应的星座能量，比如狮子座对应力量牌，天秤座对应正义牌，双鱼座对应月亮牌。',
      en: 'Major cards carry zodiac tones — Leo with Strength, Libra with Justice, Pisces with the Moon, and more.',
      pt: 'Os Arcanos Maiores carregam tons zodiacais — Leão com Força, Libra com Justiça, Peixes com a Lua, e mais.',
      es: 'Los Arcanos Mayores llevan tonos zodiacales — Leo con Fuerza, Libra con Justicia, Piscis con la Luna, y más.',
    },
  },
];

export function getKnowledgeTipForDay(dayOfYear: number, lang: Lang) {
  const tip = KNOWLEDGE_TIPS[((dayOfYear % KNOWLEDGE_TIPS.length) + KNOWLEDGE_TIPS.length) % KNOWLEDGE_TIPS.length];
  return {
    title: pick(tip.title, lang),
    content: pick(tip.content, lang),
  };
}

/** @deprecated use KNOWLEDGE_TIPS */
export const TAROT_TIPS = KNOWLEDGE_TIPS.map((tip) => ({
  title: tip.title.zh,
  content: tip.content.zh,
}));
