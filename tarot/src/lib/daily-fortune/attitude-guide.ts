/**
 * 今日启示 — 运势基调与行动指南（知识层摘要，非 LLM）
 */

import type { Lang } from '@/lib/i18n/context';

export type DailyTone = {
  question: string;
  result: string;
};

export function getDailyTone(orientation: '正位' | '逆位', lang: Lang = 'zh'): DailyTone {
  if (lang === 'en' || lang === 'es') {
    return orientation === '正位'
      ? {
          question: "Today's tone: smooth sailing or full of challenges?",
          result: 'Today leans toward smooth flow (upright).',
        }
      : {
          question: "Today's tone: smooth sailing or full of challenges?",
          result: 'Today may feel more challenging (reversed) — pace yourself.',
        };
  }
  if (lang === 'pt') {
    return orientation === '正位'
      ? {
          question: 'Tom do dia: fluidez ou desafios?',
          result: 'Hoje tende a fluir com mais facilidade (direita).',
        }
      : {
          question: 'Tom do dia: fluidez ou desafios?',
          result: 'Hoje pode trazer mais desafios (invertida) — vá com calma.',
        };
  }
  if (orientation === '正位') {
    return {
      question: '运势基调：今天会是顺利（正位）还是充满挑战（逆位）？',
      result: '今天整体基调偏顺利，适合顺势而为。',
    };
  }
  return {
    question: '运势基调：今天会是顺利（正位）还是充满挑战（逆位）？',
    result: '今天可能多一些挑战，宜放慢节奏、灵活应对。',
  };
}

type AttitudePair = { upright: string; reversed: string };

const MAJOR_ATTITUDE_ZH: Record<number, AttitudePair> = {
  0: { upright: '今天适合迈出第一步，用好奇心打开新的可能', reversed: '今天宜三思后行，避免冲动决定' },
  1: { upright: '今天适合把想法落地，专注一件事做到位', reversed: '今天先理清优先级，别同时铺开太多计划' },
  2: { upright: '今天相信直觉，在安静里听见内心的答案', reversed: '今天别过度猜疑，把感受说出来' },
  3: { upright: '今天适合滋养自己与他人，让关系更有温度', reversed: '今天留意是否忽略了自身需求' },
  4: { upright: '今天适合建立秩序，用稳定节奏推进事务', reversed: '今天放松控制，给他人也留一点空间' },
  5: { upright: '今天可向信任的人请教，遵循已验证的路径', reversed: '今天独立思考，不盲从外界意见' },
  6: { upright: '今天重视选择与连结，诚实面对内心的倾向', reversed: '今天厘清真正重要的价值，再作决定' },
  7: { upright: '今天需要勇敢推进、充满行动力', reversed: '今天宜放缓冲刺，先稳住方向再行动' },
  8: { upright: '今天用温柔与耐心化解阻力，软中带稳', reversed: '今天觉察是否压抑了真实感受' },
  9: { upright: '今天适合低调思考、减少社交', reversed: '今天不必过度孤立，适度吐露心声' },
  10: { upright: '今天接受变化，顺势调整计划', reversed: '今天若感到停滞，正是重新校准的时机' },
  11: { upright: '今天讲求公平与清晰，用事实说话', reversed: '今天放下苛责，对自己也留一点余地' },
  12: { upright: '今天适合暂停与换位思考，不必急着给答案', reversed: '今天若久拖不决，可以主动迈出小步' },
  13: { upright: '今天拥抱结束与新生，放下不再服务的旧模式', reversed: '今天抗拒改变只会增加消耗，试着松手' },
  14: { upright: '今天保持平衡与节制，调和工作与休息', reversed: '今天留意是否失衡，及时调整节奏' },
  15: { upright: '今天觉察诱惑与执念，选择更自由的视角', reversed: '今天适合解开束缚，走出习惯性困局' },
  16: { upright: '今天突发状况可能是转机，保持开放', reversed: '今天避免剧烈折腾，先巩固根基' },
  17: { upright: '今天怀抱希望，允许疗愈与恢复发生', reversed: '今天别灰心，微光仍在路上' },
  18: { upright: '今天倾听潜意识，在模糊中辨认真实信号', reversed: '今天减少胡思乱想，回到可验证的事实' },
  19: { upright: '今天大方展现活力，让乐观感染周围', reversed: '今天若情绪低落，给自己一点阳光与休息' },
  20: { upright: '今天回应内心的召唤，做出与成长一致的选择', reversed: '今天别回避已知的答案，温柔地面对' },
  21: { upright: '今天适合收尾与庆祝，看见已完成的阶段', reversed: '今天还差临门一脚，专注把最后一步走稳' },
};

const MAJOR_ATTITUDE_EN: Record<number, AttitudePair> = {
  0: { upright: 'Take a first step today — let curiosity open new doors', reversed: 'Think twice before acting; avoid impulsive decisions' },
  1: { upright: 'Bring one idea into form and finish it well', reversed: 'Clarify priorities — do not start too many plans at once' },
  2: { upright: 'Trust your intuition and listen in quiet moments', reversed: 'Do not over-suspect; name what you feel' },
  3: { upright: 'Nourish yourself and others; warm the bonds around you', reversed: 'Notice if you have neglected your own needs' },
  4: { upright: 'Build order and move with a steady rhythm', reversed: 'Loosen control and leave others some space' },
  5: { upright: 'Ask someone you trust; follow a proven path', reversed: 'Think independently — do not follow the crowd' },
  6: { upright: 'Honor choice and connection; be honest about what you want', reversed: 'Clarify what truly matters before deciding' },
  7: { upright: 'Push forward with courage and momentum', reversed: 'Ease the rush; steady the direction first' },
  8: { upright: 'Meet resistance with patience and soft strength', reversed: 'Notice if you are suppressing real feelings' },
  9: { upright: 'Keep a low profile and think quietly', reversed: 'You need not isolate — share a little' },
  10: { upright: 'Accept change and adjust plans with the current', reversed: 'If stuck, this is a moment to recalibrate' },
  11: { upright: 'Seek fairness and clarity; speak from facts', reversed: 'Drop harsh judgment — leave yourself some grace' },
  12: { upright: 'Pause and see another angle; no rush for answers', reversed: 'If delayed too long, take one small step' },
  13: { upright: 'Embrace endings and renewal; release what no longer serves', reversed: 'Fighting change only drains you — try letting go' },
  14: { upright: 'Keep balance; blend work and rest', reversed: 'Check for imbalance and reset your pace' },
  15: { upright: 'Notice temptation and attachment; choose a freer view', reversed: 'Untie a habit loop that keeps you stuck' },
  16: { upright: 'Sudden shifts may be openings — stay open', reversed: 'Avoid upheaval; reinforce your foundation first' },
  17: { upright: 'Hold hope and allow healing to happen', reversed: 'Do not lose heart — a small light is still ahead' },
  18: { upright: 'Listen to the subconscious; find real signals in the fog', reversed: 'Less rumination — return to what you can verify' },
  19: { upright: 'Show your vitality; let optimism reach others', reversed: 'If low, give yourself sunlight and rest' },
  20: { upright: 'Answer an inner call with a growth-aligned choice', reversed: 'Do not avoid a known answer — meet it gently' },
  21: { upright: 'Close a chapter and celebrate what is done', reversed: 'One last step remains — finish it with care' },
};

const SUIT_ATTITUDE_ZH: Record<string, AttitudePair> = {
  wands: { upright: '今天点燃热情，用行动点燃一件事', reversed: '今天放缓节奏，避免精力分散' },
  cups: { upright: '今天用心感受情绪，在关系里真诚表达', reversed: '今天照顾情绪边界，别过度取悦他人' },
  swords: { upright: '今天保持头脑清晰，直接沟通关键问题', reversed: '今天减少争执，先让心境平静下来' },
  pentacles: { upright: '今天踏实做事，关注健康与物质基础', reversed: '今天别只盯结果，也看看身体与节奏' },
};

const SUIT_ATTITUDE_EN: Record<string, AttitudePair> = {
  wands: { upright: 'Spark enthusiasm — put energy into one clear action', reversed: 'Slow the pace and avoid scattering your energy' },
  cups: { upright: 'Feel your emotions and speak sincerely in relationships', reversed: 'Protect emotional boundaries; do not over-please' },
  swords: { upright: 'Stay clear-headed and address the key issue directly', reversed: 'Reduce conflict — calm the mind first' },
  pentacles: { upright: 'Do solid work; tend health and material basics', reversed: 'Do not chase results only — check body and rhythm' },
};

function pickLine(
  map: Record<number | string, AttitudePair> | Record<number, AttitudePair>,
  key: number | string,
  orientation: '正位' | '逆位',
): string | null {
  const pair = map[key as never] as AttitudePair | undefined;
  if (!pair) return null;
  return orientation === '正位' ? pair.upright : pair.reversed;
}

export function getDailyAttitudeGuide(
  cardId: number,
  cardName: string,
  orientation: '正位' | '逆位',
  suit?: string,
  lang: Lang = 'zh',
): string {
  const useEn = lang === 'en' || lang === 'pt' || lang === 'es';
  const majorMap = useEn ? MAJOR_ATTITUDE_EN : MAJOR_ATTITUDE_ZH;
  const suitMap = useEn ? SUIT_ATTITUDE_EN : SUIT_ATTITUDE_ZH;

  const line =
    pickLine(majorMap, cardId, orientation)
    ?? (suit ? pickLine(suitMap, suit, orientation) : null)
    ?? (useEn
      ? (orientation === '正位'
        ? 'Move with today — put attention on the one thing that matters most'
        : 'Slow down and look at the situation from another angle')
      : (orientation === '正位'
        ? '今天顺势而为，把注意力放在当下最重要的一件事'
        : '今天放慢脚步，换个角度看待眼前的局面'));

  if (lang === 'en' || lang === 'es') {
    return `${cardName} lights this day for you: ${line}.`;
  }
  if (lang === 'pt') {
    return `${cardName} ilumina este dia para você: ${line}.`;
  }
  return `《${cardName}》为你点亮这一日：${line}。`;
}
