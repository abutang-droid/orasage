import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { tarotReaderSystem } from '@/lib/llm/prompts';
import { sanitizeTarotFullReport, sanitizeTarotReaderText } from '@/lib/llm/sanitize-output';
import { getLiteralMeaning } from '@/lib/tarot/knowledge';
import { buildReadingContext, type ReadingContextInput } from '@/lib/tarot/rules/build-context';
import type { ExtractedKnowledgeNode } from '@/lib/tarot/knowledge/types';
import {
  aiLanguageReplyRule,
  isNonChineseAiLocale,
  type AiLocale,
} from '../../../../../shared/ai-locale/index';
import {
  buildDailyFortunePrompt,
  buildLiteralTranslatePrompt,
  buildSingleFocusPrompt,
  buildSingleFullPrompt,
  buildSingleGuidancePrompt,
  buildSingleVerdictPrompt,
  buildSpreadBriefPrompt,
  buildSpreadFullPrompt,
  buildThreeCardTrilogyPrompt,
  destinySliceFocusSystem,
  trilogySystem,
} from './prompts';

// ─── Fallbacks（规则层模板，不经 LLM；en/pt 不用中文）────────

function fallbackFromNodes(
  nodes: ExtractedKnowledgeNode[],
  question: string,
  language: AiLocale = 'zh-CN',
  synthesisPrefix?: string,
) {
  const upright = (n: ExtractedKnowledgeNode) => n.orientation === '正位';
  if (isNonChineseAiLocale(language)) {
    const en = language === 'en';
    const cards = nodes.map((n) => {
      const pos = n.positionLabel ? (en ? ` in ${n.positionLabel}` : ` em ${n.positionLabel}`) : '';
      const flow = upright(n)
        ? (en ? 'energy flows more freely' : 'a energia flui com mais facilidade')
        : (en ? 'a shift in perspective is needed' : 'é preciso mudar o olhar');
      const name = n.cardNameEn || n.cardName;
      return {
        interpretation: en
          ? `「${name}」${pos} (${n.orientation === '正位' ? 'upright' : 'reversed'}): ${n.scenario.replace(/。$/, '')}. Right now ${flow}.`
          : `「${name}」${pos} (${n.orientation === '正位' ? 'direita' : 'invertida'}): ${n.scenario.replace(/。$/, '')}. Agora ${flow}.`,
        mantra: upright(n)
          ? (en ? 'Move with the current; do not force it.' : 'Siga o fluxo; não force.')
          : (en ? 'Change the angle — the answer often waits around the turn.' : 'Mude o ângulo — a resposta costuma estar na curva.'),
      };
    });
    const names = nodes.map((n) => n.cardNameEn || n.cardName).join(en ? ', ' : ', ');
    const synthesis =
      synthesisPrefix ??
      (nodes.length >= 3
        ? (en
          ? `On “${question}”, the three cards ${names} link past, present, and future — place each cue in your real situation.`
          : `Sobre “${question}”, as três cartas ${names} ligam passado, presente e futuro — leve cada sinal para a sua situação real.`)
        : (en
          ? `On “${question}”, ${names} offers guidance for now — read it with theme “${nodes[0]?.topic ?? 'overall'}”.`
          : `Sobre “${question}”, ${names} oferece orientação agora — leia com o tema “${nodes[0]?.topic ?? 'geral'}”.`));
    return {
      cards,
      synthesis,
      suggestions: en
        ? ['Treat the cards as a mirror, not a verdict.', 'In the next three days, do one small thing you have been delaying.', 'Trust the first instinct, then verify.']
        : ['Trate as cartas como espelho, não sentença.', 'Nos próximos três dias, faça uma pequena coisa que você adia.', 'Confie no primeiro impulso e depois confirme.'],
      affirmation: en
        ? 'My calm is stronger than any storm.'
        : 'Minha calma é mais forte do que qualquer tempestade.',
      llm: false,
    };
  }

  const cards = nodes.map((n) => {
    const pos = n.positionLabel ? `在${n.positionLabel}` : '';
    const flow = upright(n) ? '顺畅流动' : '需要调整的角度';
    return {
      interpretation: `「${n.cardName}」${pos}${n.orientation}，${n.scenario.replace(/。$/, '')}，当下能量${flow}。`,
      mantra: upright(n) ? '顺势而行，不必强求。' : '换个角度，答案往往就在转身处。',
    };
  });
  const names = nodes.map((n) => n.cardName).join('、');
  const synthesis =
    synthesisPrefix ??
    (nodes.length >= 3
      ? `围绕「${question}」，三牌「${names}」串联过去、现在与未来，请把每张牌的提示放进你的真实处境。`
      : `围绕「${question}」，「${names}」为当下给出指引，请结合主题「${nodes[0]?.topic ?? '整体'}」理解。`);
  return {
    cards,
    synthesis,
    suggestions: [
      '把牌面当作镜子，而不是判决书。',
      '接下来三天，做一件你一直拖着的小事。',
      '信任第一直觉给的方向。',
    ],
    affirmation: '我的平静比任何风暴都更有力量。',
    llm: false,
  };
}

// ─── Destiny slice Focus (是非/倾向切片) ─────────────────────

const focusSchema = z.object({
  tendency: z.string().min(1),
  probability: z.string().min(1),
  deconstruction: z.string().min(1),
  threshold: z.string().min(1),
});

function fallbackFocusFromNodes(nodes: ExtractedKnowledgeNode[], language: AiLocale = 'zh-CN') {
  const node = nodes[0];
  const en = language === 'en';
  const pt = language === 'pt-BR';
  if (!node) {
    return {
      tendency: en || pt ? 'Caution' : '警惕',
      probability: '50% Static // 50% Unknown',
      deconstruction: en
        ? 'Signal is weak; the state has not converged.'
        : pt
          ? 'Sinal fraco; o estado ainda não convergiu.'
          : '坐标信号弱，当前状态处于未收敛区间。',
      threshold: en
        ? 'Pause. Remove one verifiable variable, then resample.'
        : pt
          ? 'Pause. Remova uma variável verificável e amostrar de novo.'
          : '暂停推进，先剥离一个可验证的冗余变量再重采样。',
      llm: false,
    };
  }
  const forward = node.orientation === '正位';
  const pct = forward ? 68 : 34;
  const inv = 100 - pct;
  const name = isNonChineseAiLocale(language) ? (node.cardNameEn || node.cardName) : node.cardName;
  return {
    tendency: forward ? 'Yes' : (en || pt ? 'Caution' : '警惕'),
    probability: `${pct}% ${forward ? 'Forward' : 'Reverse'} // ${inv}% Standard`,
    deconstruction: en
      ? `「${name}」 maps: ${node.scenario.replace(/。$/, '')}; system in ${forward ? 'forward convergence' : 'reverse drag'}.`
      : pt
        ? `「${name}」 mapeia: ${node.scenario.replace(/。$/, '')}; sistema em ${forward ? 'convergência' : 'arrasto reverso'}.`
        : `「${node.cardName}」${node.orientation}映射：${node.scenario.replace(/。$/, '')}，系统处于${forward ? '正向收敛' : '逆向阻滞'}相位。`,
    threshold: node.advice[0]
      ?? (en
        ? 'Set one trigger condition; only then take the next step.'
        : pt
          ? 'Defina um único gatilho; só então avance.'
          : '设定单一触发条件，满足后再执行下一步，避免多变量并行。'),
    llm: false,
  };
}

export async function generateDestinySliceGuidanceFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'single' });
  const fallback = fallbackFocusFromNodes(ctx.nodes, ctx.language);

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: destinySliceFocusSystem(ctx.language),
    user: buildSingleFocusPrompt(ctx),
    maxTokens: 500,
    temperature: 0.35,
    timeoutMs: 24000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = focusSchema.safeParse(parsed);
  if (!validated.success) return fallback;

  return {
    tendency: sanitizeTarotReaderText(validated.data.tendency),
    probability: sanitizeTarotReaderText(validated.data.probability),
    deconstruction: sanitizeTarotReaderText(validated.data.deconstruction),
    threshold: sanitizeTarotReaderText(validated.data.threshold),
    llm: true,
  };
}

// ─── Legacy guidance schema (行动指引) ───────────────────────

const guidanceSchema = z.object({
  action: z.string().min(1),
  insight: z.string().min(1),
});

function fallbackGuidanceFromNodes(nodes: ExtractedKnowledgeNode[], question: string) {
  const node = nodes[0];
  if (!node) {
    return {
      action: '先停下来，把两个选项各写下来，对比你真正害怕失去的是什么。',
      insight: '牌面信息暂不可用，但犹豫本身说明你在认真对待这个选择。',
      llm: false,
    };
  }
  const advice = node.advice[0] ?? '给自己一点空间，不必今天就做决定。';
  return {
    action: advice,
    insight: `围绕「${question}」，「${node.cardName}」${node.orientation}提示：${node.scenario.replace(/。$/, '')}`,
    llm: false,
  };
}

/** @deprecated 旧版行动指引生成 */
export async function generateDestinySliceLegacyGuidanceFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'single' });
  const fallback = fallbackGuidanceFromNodes(ctx.nodes, ctx.question);

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: tarotReaderSystem(ctx.language),
    user: buildSingleGuidancePrompt(ctx),
    maxTokens: 700,
    temperature: 0.75,
    timeoutMs: 24000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = guidanceSchema.safeParse(parsed);
  if (!validated.success) return fallback;

  return {
    action: sanitizeTarotReaderText(validated.data.action),
    insight: sanitizeTarotReaderText(validated.data.insight),
    llm: true,
  };
}

// ─── Single-card verdict (是/否启示, legacy) ─────────────────

const verdictSchema = z.object({
  verdict: z.enum(['yes', 'no', 'lean_yes', 'lean_no', 'unclear']),
  headline: z.string().min(1),
  explanation: z.string().min(1),
  guidance: z.string().min(1),
});

function fallbackVerdictFromNodes(
  nodes: ExtractedKnowledgeNode[],
  question: string,
  language: AiLocale = 'zh-CN',
) {
  const node = nodes[0];
  const en = language === 'en';
  const pt = language === 'pt-BR';
  if (!node) {
    return {
      verdict: 'unclear' as const,
      headline: en ? 'No firm answer yet' : pt ? 'Ainda sem resposta firme' : '此刻不宜强行下定论',
      explanation: en
        ? 'Card data is unavailable. Try again shortly.'
        : pt
          ? 'Dados da carta indisponíveis. Tente de novo em breve.'
          : '牌面信息暂不可用，请稍后再试或换一种方式提问。',
      guidance: en
        ? 'Make the question more specific, then draw again.'
        : pt
          ? 'Deixe a pergunta mais específica e tire de novo.'
          : '把问题写得更具体一些，再抽一次看看。',
      llm: false,
    };
  }
  const positive = node.orientation === '正位';
  const verdict = positive ? ('lean_yes' as const) : ('lean_no' as const);
  const name = isNonChineseAiLocale(language) ? (node.cardNameEn || node.cardName) : node.cardName;
  const headline = positive
    ? (en ? 'Leaning yes' : pt ? 'Inclina para sim' : '倾向于「是」')
    : (en ? 'Leaning no' : pt ? 'Inclina para não' : '倾向于「否」');
  return {
    verdict,
    headline,
    explanation: en
      ? `On “${question}”, 「${name}」 points to ${node.scenario.replace(/。$/, '')}.`
      : pt
        ? `Sobre “${question}”, 「${name}」 aponta para ${node.scenario.replace(/。$/, '')}.`
        : `围绕「${question}」，「${node.cardName}」${node.orientation}指向${node.scenario.replace(/。$/, '')}。${node.meaning}`,
    guidance: node.advice[0]
      ?? (en
        ? 'Trust the first instinct, and leave room to observe.'
        : pt
          ? 'Confie no primeiro impulso e deixe espaço para observar.'
          : '信任第一直觉，同时留一点余地观察变化。'),
    llm: false,
  };
}

export async function generateSingleCardVerdictFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'single' });
  const fallback = fallbackVerdictFromNodes(ctx.nodes, ctx.question, ctx.language);

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: tarotReaderSystem(ctx.language),
    user: buildSingleVerdictPrompt(ctx),
    maxTokens: 900,
    temperature: 0.75,
    timeoutMs: 26000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = verdictSchema.safeParse(parsed);
  if (!validated.success) return fallback;

  return {
    verdict: validated.data.verdict,
    headline: sanitizeTarotReaderText(validated.data.headline),
    explanation: sanitizeTarotReaderText(validated.data.explanation),
    guidance: sanitizeTarotReaderText(validated.data.guidance),
    llm: true,
  };
}

// ─── Single-card full ─────────────────────────────────────────

const fullSchema = z.object({
  cards: z.array(z.object({ interpretation: z.string().min(1), mantra: z.string().min(1) })).min(1),
  synthesis: z.string().min(1),
  suggestions: z.array(z.string().min(1)).min(1).max(5),
  affirmation: z.string().min(1),
});

export async function generateSingleCardFullFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'single' });
  const fallback = fallbackFromNodes(ctx.nodes, ctx.question, ctx.language);

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: tarotReaderSystem(ctx.language),
    user: buildSingleFullPrompt(ctx),
    maxTokens: 1400,
    temperature: 0.8,
    timeoutMs: 28000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = fullSchema.safeParse(parsed);
  if (!validated.success) return fallback;
  return sanitizeTarotFullReport({ ...validated.data, llm: true });
}

// ─── Spread full (three-card / generic) ───────────────────────

export async function generateSpreadFullFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext(input);
  const fallback = fallbackFromNodes(ctx.nodes, ctx.question, ctx.language);

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: tarotReaderSystem(ctx.language),
    user: buildSpreadFullPrompt(ctx),
    maxTokens: 1800,
    temperature: 0.8,
    timeoutMs: 28000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = fullSchema.safeParse(parsed);
  if (!validated.success || validated.data.cards.length !== ctx.nodes.length) return fallback;
  return { ...validated.data, llm: true };
}

// ─── Spread brief ─────────────────────────────────────────────

const briefSchema = z.object({
  perCard: z.array(z.object({ position: z.string().min(1), text: z.string().min(1) })).min(1),
  synthesis: z.string().min(1),
});

export async function generateSpreadBriefFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext(input);
  const en = ctx.language === 'en';
  const pt = ctx.language === 'pt-BR';
  const fallback = {
    perCard: ctx.nodes.map((n) => ({
      position: n.positionLabel ?? (isNonChineseAiLocale(ctx.language) ? (n.cardNameEn || n.cardName) : n.cardName),
      text: n.scenario.slice(0, 70),
    })),
    synthesis: en
      ? `On “${ctx.question}”, the cards highlight “${ctx.topicLabel}” — keep watching this theme.`
      : pt
        ? `Sobre “${ctx.question}”, as cartas destacam “${ctx.topicLabel}” — continue observando este tema.`
        : `围绕「${ctx.question}」，牌面提示${ctx.topicLabel}议题值得持续关注。`,
    llm: false,
  };

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: tarotReaderSystem(ctx.language),
    user: buildSpreadBriefPrompt(ctx),
    maxTokens: 900,
    temperature: 0.8,
    timeoutMs: 24000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = briefSchema.safeParse(parsed);
  if (!validated.success || validated.data.perCard.length !== ctx.nodes.length) return fallback;
  return { ...validated.data, llm: true };
}

// ─── Three-card Trilogy (脉络解构) ───────────────────────────

const trilogySchema = z.object({
  mode: z.string().min(1),
  nodes: z.array(z.object({
    position: z.string().min(1),
    cardName: z.string().min(1),
    mapping: z.string().min(1),
  })).min(3),
  chainAnalysis: z.string().min(1),
  actionThreshold: z.string().min(1),
});

function fallbackTrilogyFromNodes(nodes: ExtractedKnowledgeNode[], language: AiLocale = 'zh-CN') {
  const en = language === 'en';
  const pt = language === 'pt-BR';
  const trilogyNodes = nodes.map((n) => ({
    position: n.positionLabel ?? (isNonChineseAiLocale(language) ? (n.cardNameEn || n.cardName) : n.cardName),
    cardName: isNonChineseAiLocale(language) ? (n.cardNameEn || n.cardName) : n.cardName,
    mapping: en
      ? `${n.scenario.replace(/。$/, '')}; ${n.orientation === '正位' ? 'forward baseline' : 'reverse disturbance'}.`
      : pt
        ? `${n.scenario.replace(/。$/, '')}; ${n.orientation === '正位' ? 'linha de base' : 'perturbação reversa'}.`
        : `${n.scenario.replace(/。$/, '')}，${n.orientation === '正位' ? '正向基线' : '逆向扰动'}。`,
  }));
  const names = nodes.map((n) => (isNonChineseAiLocale(language) ? (n.cardNameEn || n.cardName) : n.cardName)).join(' → ');
  const converging = nodes[2]?.orientation === '正位';
  return {
    mode: en || pt ? 'Timeline (Past-Present-Future)' : '时序脉络 (Past-Present-Future)',
    nodes: trilogyNodes,
    chainAnalysis: en
      ? `Chain ${names}: past noise refracts through the present; future vector trends ${converging ? 'convergent' : 'divergent'}.`
      : pt
        ? `Cadeia ${names}: ruído do passado refrata no presente; vetor futuro tende a ${converging ? 'convergir' : 'divergir'}.`
        : `链路 ${names}：历史冗余经现在态折射，未来向量呈${converging ? '收敛' : '发散'}趋势。`,
    actionThreshold: nodes[1]?.advice[0]
      ?? (en
        ? 'Set one trigger threshold; advance only after it is met.'
        : pt
          ? 'Defina um único limiar; só avance depois de atingido.'
          : '设定单一触发阈值，满足后再推进下一节点。'),
    llm: false,
  };
}

export async function generateThreeCardTrilogyFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'three-card' });
  const fallback = fallbackTrilogyFromNodes(ctx.nodes, ctx.language);

  if (!isLlmConfigured() || ctx.nodes.length < 3) return fallback;

  const raw = await chatCompletion({
    system: trilogySystem(ctx.language),
    user: buildThreeCardTrilogyPrompt(ctx),
    maxTokens: 800,
    temperature: 0.35,
    timeoutMs: 28000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = trilogySchema.safeParse(parsed);
  if (!validated.success) return fallback;

  return {
    mode: sanitizeTarotReaderText(validated.data.mode),
    nodes: validated.data.nodes.map((n) => ({
      position: sanitizeTarotReaderText(n.position),
      cardName: sanitizeTarotReaderText(n.cardName),
      mapping: sanitizeTarotReaderText(n.mapping),
    })),
    chainAnalysis: sanitizeTarotReaderText(validated.data.chainAnalysis),
    actionThreshold: sanitizeTarotReaderText(validated.data.actionThreshold),
    llm: true,
  };
}

// ─── Daily fortune ────────────────────────────────────────────

const dailySchema = z.object({
  brief: z.string().min(1),
  full: z.object({
    work: z.object({ tag: z.string().min(1), text: z.string().min(1) }),
    love: z.object({ tag: z.string().min(1), text: z.string().min(1) }),
    career: z.object({ tag: z.string().min(1), text: z.string().min(1) }),
    wealth: z.object({ tag: z.string().min(1), text: z.string().min(1) }),
    summary: z.string().min(1),
  }),
});

export async function generateDailyFortuneFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'daily' });
  const node = ctx.nodes[0];
  const mk = (tag: string, text: string) => ({ tag, text });
  const en = ctx.language === 'en';
  const pt = ctx.language === 'pt-BR';
  const name = node ? (isNonChineseAiLocale(ctx.language) ? (node.cardNameEn || node.cardName) : node.cardName) : '';
  const fallback = isNonChineseAiLocale(ctx.language)
    ? {
        brief: node
          ? (en
            ? `Today’s card 「${name}」 points to ${ctx.topicLabel}. ${node.scenario}`
            : `A carta de hoje 「${name}」 aponta para ${ctx.topicLabel}. ${node.scenario}`)
          : (en ? 'Daily fortune is unavailable right now.' : 'A fortuna diária não está disponível agora.'),
        full: {
          work: mk(en ? 'Steady' : 'Estável', node ? (en ? `At work: ${node.advice[0]}` : `No trabalho: ${node.advice[0]}`) : (en ? 'Stay patient.' : 'Mantenha a paciência.')),
          love: mk(en ? 'Gentle' : 'Suave', node ? (en ? `In love, notice signals around ${node.keywords[0] ?? 'the heart'}.` : `No amor, note sinais em torno de ${node.keywords[0] ?? 'o coração'}.`) : (en ? 'Speak sincerely.' : 'Fale com sinceridade.')),
          career: mk(en ? 'Building' : 'Preparando', node ? (en ? `Career: ${node.advice[1] ?? node.scenario}` : `Carreira: ${node.advice[1] ?? node.scenario}`) : (en ? 'Sort your priorities.' : 'Organize prioridades.')),
          wealth: mk(en ? 'Cautious' : 'Cauteloso', en ? 'In money, prefer defense over offense; small tests are fine.' : 'Em dinheiro, prefira defesa a ataque; testes pequenos estão ok.'),
          summary: node?.scenario ?? '',
        },
        llm: false,
      }
    : {
        brief: node
          ? `今日主牌「${node.cardName}」（${node.orientation}）指向${ctx.topicLabel}。${node.scenario}`
          : '今日运势暂不可用。',
        full: {
          work: mk('平稳', node ? `工作方面，${node.advice[0]}` : '保持耐心。'),
          love: mk('温和', node ? `感情方面，留意${node.keywords[0] ?? '内心'}带来的信号。` : '真诚表达。'),
          career: mk('蓄势', node ? `事业层面，${node.advice[1] ?? node.scenario}` : '整理优先级。'),
          wealth: mk('谨慎', '财运上宜守不宜攻，小额试探可以。'),
          summary: node?.meaning ?? '',
        },
        llm: false,
      };

  if (!isLlmConfigured() || !node) return fallback;

  const raw = await chatCompletion({
    system: tarotReaderSystem(ctx.language),
    user: buildDailyFortunePrompt(ctx),
    maxTokens: 1400,
    temperature: 0.8,
    timeoutMs: 28000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = dailySchema.safeParse(parsed);
  if (!validated.success) return fallback;
  return { ...validated.data, llm: true };
}

// ─── Literal meaning（第一层直出 / 第三层仅翻译）──────────────

export async function generateLiteralMeaningFromLayers(input: {
  cardId: number;
  cardName: string;
  cardNameEn: string;
  orientation: '正位' | '逆位';
  language?: ReadingContextInput['language'];
}) {
  const { cardId, cardName, cardNameEn, orientation, language = 'zh-CN' } = input;
  const meaning = getLiteralMeaning(cardId, orientation);
  const unavailable =
    language === 'en'
      ? 'Card meaning is temporarily unavailable.'
      : language === 'pt-BR'
        ? 'O significado da carta está temporariamente indisponível.'
        : '牌面释义暂不可用。';
  if (!meaning) return { text: unavailable, literal: true as const, llm: false };

  if (language === 'zh-CN' || language === 'zh-TW') {
    return { text: sanitizeTarotReaderText(meaning), literal: true as const, llm: false };
  }

  const stub =
    language === 'en'
      ? `${cardNameEn || cardName} (${orientation === '正位' ? 'upright' : 'reversed'}): meaning translation unavailable; please retry shortly.`
      : `${cardNameEn || cardName} (${orientation === '正位' ? 'direita' : 'invertida'}): tradução indisponível; tente de novo em breve.`;

  if (!isLlmConfigured()) {
    // Never leak Chinese literal text into en / pt-BR UI
    return { text: stub, literal: true as const, llm: false };
  }

  const raw = await chatCompletion({
    system: `You are a tarot meaning translator. Translate only; do not expand or personalize.\n${aiLanguageReplyRule(language)}`,
    user: buildLiteralTranslatePrompt(meaning, cardName, cardNameEn, orientation, language),
    maxTokens: 400,
    temperature: 0.2,
    timeoutMs: 15000,
  });
  if (!raw) return { text: stub, literal: true as const, llm: false };
  return { text: sanitizeTarotReaderText(raw), literal: true as const, llm: true };
}

export { buildReadingContext };
