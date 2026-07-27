const LOCALES = [
  { code: 'zh-CN', label: '简体' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
] as const;

type DiyBeadI18nFieldsProps = {
  nameI18n?: Record<string, string> | null;
  materialI18n?: Record<string, string> | null;
};

/** DIY 珠子名称 / 材质多语言（zh-CN · en · pt-BR） */
export function DiyBeadI18nFields({ nameI18n, materialI18n }: DiyBeadI18nFieldsProps) {
  return (
    <fieldset className="full-width product-i18n-fields">
      <legend>多语言（可选，留空则使用上方默认中文字段）</legend>
      {LOCALES.map((loc) => (
        <div key={loc.code} className="product-i18n-row">
          <p className="product-i18n-locale-label">{loc.label}</p>
          <label>
            名称
            <input
              name={`name_i18n_${loc.code}`}
              defaultValue={nameI18n?.[loc.code] ?? ''}
              placeholder={loc.code}
            />
          </label>
          <label>
            材质
            <input
              name={`material_i18n_${loc.code}`}
              defaultValue={materialI18n?.[loc.code] ?? ''}
              placeholder={loc.code}
            />
          </label>
        </div>
      ))}
    </fieldset>
  );
}
