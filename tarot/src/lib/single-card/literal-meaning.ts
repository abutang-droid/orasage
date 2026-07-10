import type { AiLocale } from '../../../../shared/ai-locale/index';
import { generateLiteralMeaningFromLayers } from '@/lib/tarot/generation/generate';
import type { SingleCardBriefPayload, SingleCardStoredCard } from './types';

/** 免费层：牌面字面释义（第一层知识库直出，非个性化） */
export async function generateSingleCardLiteralMeaning(input: {
  card: SingleCardStoredCard;
  language?: AiLocale;
}): Promise<SingleCardBriefPayload> {
  const { card, language = 'zh-CN' } = input;
  return generateLiteralMeaningFromLayers({
    cardId: card.cardId,
    cardName: card.cardName,
    cardNameEn: card.cardNameEn,
    orientation: card.orientation,
    language,
  });
}
