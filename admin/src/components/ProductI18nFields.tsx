const LOCALES = [
  { code: 'zh-CN', label: '简体' },
  { code: 'zh-TW', label: '繁體' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
] as const;

type ProductI18nFieldsProps = {
  nameI18n?: Record<string, string> | null;
  descriptionI18n?: Record<string, string> | null;
};

export function ProductI18nFields({ nameI18n, descriptionI18n }: ProductI18nFieldsProps) {
  return (
    <fieldset className="full-width product-i18n-fields">
      <legend>多语言（可选，留空则使用上方默认名称/描述）</legend>
      {LOCALES.map((loc) => (
        <div key={loc.code} className="product-i18n-row">
          <label>
            名称 · {loc.label}
            <input
              name={`name_i18n_${loc.code}`}
              defaultValue={nameI18n?.[loc.code] ?? ''}
              placeholder={loc.code}
            />
          </label>
          <label>
            描述 · {loc.label}
            <textarea
              name={`description_i18n_${loc.code}`}
              rows={2}
              defaultValue={descriptionI18n?.[loc.code] ?? ''}
              placeholder={loc.code}
            />
          </label>
        </div>
      ))}
    </fieldset>
  );
}
