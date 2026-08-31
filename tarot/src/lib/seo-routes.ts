import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';

export function tarotPageMeta(
  path: string,
  title: string,
  description: string,
  opts?: { noindex?: boolean },
) {
  const canonical = path === '/' ? ORASAGE_URLS.tarot : `${ORASAGE_URLS.tarot}${path.startsWith('/') ? path : `/${path}`}`;
  return buildOrasageMetadata({
    title,
    description,
    metadataBase: new URL(ORASAGE_URLS.tarot),
    canonical,
    robots: opts?.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: canonical },
    ogImage: `${ORASAGE_URLS.tarot}/og.png`,
  });
}

export const TAROT_SITEMAP_ROUTES: Array<{
  path: string;
  title: string;
  description: string;
  priority?: number;
  noindex?: boolean;
}> = [
  {
    path: '/',
    title: 'Tarot Reading · Daily Blessing',
    description: 'AI tarot × daily worship × elemental crystals',
    priority: 1,
  },
  {
    path: '/daily-fortune',
    title: 'Daily Fortune',
    description: 'Work, love, career, and wealth readings',
    priority: 0.9,
  },
  {
    path: '/fortune',
    title: 'Fortune',
    description: 'Tarot fortune readings',
    priority: 0.85,
  },
  {
    path: '/reading',
    title: 'Three-Card Reading',
    description: 'Past, present, and future tarot spread',
    priority: 0.85,
  },
  {
    path: '/single-card',
    title: 'Single Card Reading',
    description: 'Quick single-card tarot guidance',
    priority: 0.8,
  },
  {
    path: '/daily-card',
    title: 'Daily Card',
    description: 'Your card of the day',
    priority: 0.8,
  },
  {
    path: '/dream',
    title: 'Dream Interpretation',
    description: 'Tarot-assisted dream analysis',
    priority: 0.75,
  },
  {
    path: '/angel-card',
    title: 'Angel Card',
    description: 'Angel card guidance reading',
    priority: 0.75,
  },
  {
    path: '/wish',
    title: 'Wish & Blessing',
    description: 'Make a wish and receive a blessing',
    priority: 0.7,
  },
  {
    path: '/temple',
    title: 'Daily Temple',
    description: 'Daily worship and blessing rituals',
    priority: 0.8,
  },
  {
    path: '/knowledge',
    title: 'Tarot Knowledge',
    description: 'Learn tarot symbolism and practice',
    priority: 0.7,
  },
  {
    path: '/crystal',
    title: 'Crystal Recommendations',
    description: 'Elemental crystal matches from your reading',
    priority: 0.7,
  },
  {
    path: '/onboarding',
    title: 'Meet You · Manto',
    description: 'Tarot onboarding with Manto',
    priority: 0.5,
  },
  {
    path: '/login',
    title: 'Sign In',
    description: 'Sign in to Tarot Mind',
    noindex: true,
  },
  {
    path: '/history',
    title: 'Reading History',
    description: 'Your past tarot readings',
    noindex: true,
  },
  {
    path: '/profile',
    title: 'My Profile',
    description: 'Tarot profile and settings',
    noindex: true,
  },
  {
    path: '/settings',
    title: 'Settings',
    description: 'Tarot app settings',
    noindex: true,
  },
];
