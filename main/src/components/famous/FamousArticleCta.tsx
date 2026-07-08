import { getTranslations } from 'next-intl/server';
import { externalUrls } from '@/lib/urls';
import { buttonVariants, Card, CardContent } from '@orasage/ui';

/** 名人案例文末区：免责声明 + 排盘转化 CTA */
export async function FamousArticleCta() {
  const t = await getTranslations('famous');

  return (
    <footer className="mt-10 space-y-6 sm:mt-12">
      <p className="rounded-[var(--os-radius-card)] border border-dashed border-border bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        {t('disclaimer')}
      </p>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:p-8">
          <h2 className="font-serif text-heading-3 font-medium text-foreground">{t('ctaTitle')}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{t('ctaDesc')}</p>
          <a href={externalUrls.bazi} className={buttonVariants({ size: 'lg', className: 'mt-2' })}>
            {t('ctaButton')}
          </a>
        </CardContent>
      </Card>
    </footer>
  );
}
