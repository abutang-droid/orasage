export const ZIWEI_CHAT_PACK_SKU = 'ziwei-chat-pack-10';
export const ZIWEI_CHAT_YEARLY_SKU = 'ziwei-chat-yearly';

export function isZiweiChatSku(sku: string | null | undefined): boolean {
  return sku === ZIWEI_CHAT_PACK_SKU || sku === ZIWEI_CHAT_YEARLY_SKU;
}
