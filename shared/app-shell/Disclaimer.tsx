import {
  getDisclaimerCopy,
  type DisclaimerVariant,
} from './disclaimer-copy';

export type DisclaimerProps = {
  variant: DisclaimerVariant;
  /** Site locale e.g. zh-CN / en / pt-BR */
  locale?: string | null;
  /** Famous-profile extra bullet (full variant only) */
  figureNote?: boolean;
  className?: string;
  /** Compact single-paragraph style for footer / PDP microcopy */
  compact?: boolean;
};

/**
 * Entertainment-only disclosure (PRD §8.1 / R1).
 * Always visible — do not collapse behind "expand".
 */
export function Disclaimer({
  variant,
  locale = 'en',
  figureNote = false,
  className = '',
  compact = false,
}: DisclaimerProps) {
  const { title, lines } = getDisclaimerCopy(variant, locale, figureNote);
  const classes = [
    'orasage-disclaimer',
    `orasage-disclaimer--${variant}`,
    compact ? 'orasage-disclaimer--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (compact) {
    return (
      <aside className={classes} data-variant={variant} role="note" aria-label={title}>
        <p>
          <strong>{title}</strong>
          {lines.length ? ` ${lines.join(' ')}` : null}
        </p>
      </aside>
    );
  }

  return (
    <aside className={classes} data-variant={variant} role="note" aria-label={title}>
      <p className="orasage-disclaimer-title">
        <strong>{title}</strong>
      </p>
      {lines.map((line) => (
        <p key={line.slice(0, 48)}>{line}</p>
      ))}
    </aside>
  );
}
