const LOCALES = [
  { code: 'zh-CN', label: '简体' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
] as const;

type ProductI18nFieldsProps = {
  nameI18n?: Record<string, string> | null;
  descriptionI18n?: Record<string, string> | null;
  materialI18n?: Record<string, string> | null;
  colorI18n?: Record<string, string> | null;
  packagingI18n?: Record<string, string> | null;
  seoTitleI18n?: Record<string, string> | null;
  seoDescI18n?: Record<string, string> | null;
  showAttributes?: boolean;
  showSeo?: boolean;
};

export function ProductI18nFields({
  nameI18n,
  descriptionI18n,
  materialI18n,
  colorI18n,
  packagingI18n,
  seoTitleI18n,
  seoDescI18n,
  showAttributes = false,
  showSeo = false,
}: ProductI18nFieldsProps) {
  return (
    <fieldset className="full-width product-i18n-fields">
      <legend>多语言（可选，留空则使用默认中文字段）</legend>
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
            描述
            <textarea
              name={`description_i18n_${loc.code}`}
              rows={2}
              defaultValue={descriptionI18n?.[loc.code] ?? ''}
              placeholder={loc.code}
            />
          </label>
          {showAttributes ? (
            <>
              <label>
                材质
                <input
                  name={`material_i18n_${loc.code}`}
                  defaultValue={materialI18n?.[loc.code] ?? ''}
                  placeholder={loc.code}
                />
              </label>
              <label>
                颜色
                <input
                  name={`color_i18n_${loc.code}`}
                  defaultValue={colorI18n?.[loc.code] ?? ''}
                  placeholder={loc.code}
                />
              </label>
              <label>
                包装
                <textarea
                  name={`packaging_i18n_${loc.code}`}
                  rows={2}
                  defaultValue={packagingI18n?.[loc.code] ?? ''}
                  placeholder={loc.code}
                />
              </label>
            </>
          ) : null}
          {showSeo ? (
            <>
              <label>
                SEO 标题
                <input
                  name={`seo_title_i18n_${loc.code}`}
                  defaultValue={seoTitleI18n?.[loc.code] ?? ''}
                  placeholder={loc.code}
                />
              </label>
              <label>
                SEO 描述
                <textarea
                  name={`seo_desc_i18n_${loc.code}`}
                  rows={2}
                  defaultValue={seoDescI18n?.[loc.code] ?? ''}
                  placeholder={loc.code}
                />
              </label>
            </>
          ) : null}
        </div>
      ))}
    </fieldset>
  );
}
