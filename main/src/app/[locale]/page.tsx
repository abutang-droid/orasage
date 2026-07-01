import { Hero, ToolCards, ContentSections } from '@/components/HomeSections';
import { setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ToolCards />
      <ContentSections />
    </>
  );
}
