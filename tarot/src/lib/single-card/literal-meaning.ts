import { chatCompletion, isLlmConfigured } from '@/lib/llm/client';
import { aiPromptLanguageLine, type AiLocale } from '../../../../shared/ai-locale/index';
import { getCardById } from '@/lib/tarot/cards';
import { sanitizeTarotReaderText } from '@/lib/llm/sanitize-output';
import type { SingleCardBriefPayload, SingleCardStoredCard } from './types';

function literalFromCard(card: SingleCardStoredCard): string | null {
  const meta = getCardById(card.cardId);
  if (!meta) return null;
  return card.orientation === '正位' ? meta.meaningUp : meta.meaningDown;
}

async function translateLiteralMeaning(
  meaning: string,
  card: SingleCardStoredCard,
  language: AiLocale,
): Promise<string> {
  if (!isLlmConfigured()) return meaning;

  const userPrompt = `${aiPromptLanguageLine(language)}
牌名：${card.cardName} / ${card.cardNameEn}
牌位：${card.orientation}

以下是一条韦特塔罗牌的标准字面释义（书义），请仅翻译为对应语言，不要添加个性化解读，不要提及 AI：
${meaning}

只输出翻译后的释义正文，不要引号、不要 JSON、不要标题。`;

  const raw = await chatCompletion({
    system: '你是塔罗牌义译者。只翻译给定牌义，不扩写、不个性化。',
    user: userPrompt,
    maxTokens: 400,
    temperature: 0.2,
    timeoutMs: 15000,
  });

  if (!raw) return meaning;
  return sanitizeTarotReaderText(raw);
}

/** 免费层：牌面字面释义（书义），非个性化简读 */
export async function generateSingleCardLiteralMeaning(input: {
  card: SingleCardStoredCard;
  language?: AiLocale;
}): Promise<SingleCardBriefPayload> {
  const { card, language = 'zh-CN' } = input;
  const meaning = literalFromCard(card);
  if (!meaning) {
    return { text: '牌面释义暂不可用。', literal: true, llm: false };
  }

  if (language === 'zh-CN' || language === 'zh-TW') {
    return { text: sanitizeTarotReaderText(meaning), literal: true, llm: false };
  }

  const translated = await translateLiteralMeaning(meaning, card, language);
  return { text: translated, literal: true, llm: true };
}
