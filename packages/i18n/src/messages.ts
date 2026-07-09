/** Unified message/dictionary runtime — single source for all apps. */

export type Messages = Record<string, string>;
export type MessageParams = Record<string, string | number>;
export type TranslateFn = (key: string, params?: MessageParams) => string;

/** Catalog of static dictionaries keyed by locale (e.g. { 'zh-CN': {...} }). */
export type MessageCatalog = Partial<Record<string, Messages>>;

/** Interpolate `{param}` placeholders. */
export function formatMessage(template: string, params?: MessageParams): string {
  if (!params) return template;
  let out = template;
  for (const [key, value] of Object.entries(params)) {
    out = out.split(`{${key}}`).join(String(value));
  }
  return out;
}

/** Build a `t(key, params)` function over one resolved dictionary. Missing keys pass through. */
export function createTranslator(messages: Messages): TranslateFn {
  return (key, params) => {
    const raw = messages[key];
    if (raw == null) return key;
    return formatMessage(raw, params);
  };
}
