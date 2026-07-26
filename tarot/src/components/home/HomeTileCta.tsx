import {
  ChevronRight,
  Flame,
  Layers,
  Scan,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type HomeTileCtaVariant = 'daily' | 'single' | 'three' | 'temple';

const CTA_ICONS: Record<HomeTileCtaVariant, LucideIcon> = {
  daily: Sparkles,
  single: Scan,
  three: Layers,
  temple: Flame,
};

type HomeTileCtaProps = {
  label: string;
  variant: HomeTileCtaVariant;
  primary?: boolean;
};

/** Strip CTA inside home tiles — lucide chrome icon per design-system §9. */
export function HomeTileCta({ label, variant, primary = false }: HomeTileCtaProps) {
  const Icon = CTA_ICONS[variant];
  return (
    <span className={`home-tile-cta${primary ? ' home-tile-cta--primary' : ''}`}>
      <Icon className="home-tile-cta-icon" size={18} strokeWidth={1.6} aria-hidden />
      <span className="home-tile-cta-label">{label}</span>
      <ChevronRight className="home-tile-cta-chevron" size={16} strokeWidth={1.6} aria-hidden />
    </span>
  );
}
