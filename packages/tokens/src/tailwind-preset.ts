import type { Config } from 'tailwindcss';

/** Tailwind v3 preset — maps OraSage tokens to utility classes */
export const orasageTailwindPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        sage: {
          bg: 'var(--orasage-background)',
          card: 'var(--orasage-surface)',
          primary: 'var(--orasage-primary)',
          muted: 'var(--orasage-muted)',
          border: 'var(--orasage-border)',
          gold: 'var(--orasage-gold)',
          'gold-light': 'var(--orasage-gold-light)',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--orasage-radius-lg)',
        md: 'var(--orasage-radius-md)',
        sm: 'var(--orasage-radius-sm)',
      },
      fontFamily: {
        sans: ['var(--orasage-font-sans)'],
        serif: ['var(--orasage-font-serif)'],
      },
      height: {
        'control-sm': 'var(--orasage-control-h-sm)',
        'control-md': 'var(--orasage-control-h-md)',
        'control-lg': 'var(--orasage-control-h-lg)',
      },
      minHeight: {
        'control-sm': 'var(--orasage-control-h-sm)',
        'control-md': 'var(--orasage-control-h-md)',
        'control-lg': 'var(--orasage-control-h-lg)',
      },
    },
  },
};

export default orasageTailwindPreset;
