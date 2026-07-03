import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    '../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: withOpacity('--background'),
        foreground: withOpacity('--foreground'),
        card: {
          DEFAULT: withOpacity('--card'),
          foreground: withOpacity('--card-foreground'),
        },
        popover: {
          DEFAULT: withOpacity('--popover'),
          foreground: withOpacity('--popover-foreground'),
        },
        primary: {
          DEFAULT: withOpacity('--primary'),
          foreground: withOpacity('--primary-foreground'),
        },
        secondary: {
          DEFAULT: withOpacity('--secondary'),
          foreground: withOpacity('--secondary-foreground'),
        },
        muted: {
          DEFAULT: withOpacity('--muted'),
          foreground: withOpacity('--muted-foreground'),
        },
        accent: {
          DEFAULT: withOpacity('--accent'),
          foreground: withOpacity('--accent-foreground'),
        },
        destructive: {
          DEFAULT: withOpacity('--destructive'),
          foreground: withOpacity('--destructive-foreground'),
        },
        border: withOpacity('--border'),
        input: withOpacity('--input'),
        ring: withOpacity('--ring'),
        brand: {
          primary: withOpacity('--brand-primary'),
          gold: withOpacity('--brand-gold'),
          purple: withOpacity('--brand-purple'),
        },
        // Legacy compatibility for existing pages. Migrate to semantic colors over time.
        sage: {
          bg: 'var(--orasage-background)',
          card: 'var(--orasage-surface)',
          border: 'var(--orasage-border)',
          gold: 'var(--orasage-gold)',
          purple: 'var(--orasage-purple)',
          muted: 'var(--orasage-muted)',
          primary: 'var(--orasage-primary)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        'radius-sm': 'var(--radius-sm)',
        'radius-md': 'var(--radius-md)',
        'radius-lg': 'var(--radius-lg)',
        'radius-xl': 'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['var(--os-font-sans)'],
        serif: ['var(--os-font-serif-zh)'],
        'serif-latin': ['var(--os-font-serif-latin)'],
        numeric: ['var(--os-font-numeric)'],
      },
      fontSize: {
        'display-1': ['var(--os-font-display-1)', { lineHeight: 'var(--os-line-display-1)' }],
        'display-2': ['var(--os-font-display-2)', { lineHeight: 'var(--os-line-display-2)' }],
        'heading-1': ['var(--os-font-heading-1)', { lineHeight: 'var(--os-line-heading-1)' }],
        'heading-2': ['var(--os-font-heading-2)', { lineHeight: 'var(--os-line-heading-2)' }],
        'heading-3': ['var(--os-font-heading-3)', { lineHeight: 'var(--os-line-heading-3)' }],
        'heading-4': ['var(--os-font-heading-4)', { lineHeight: 'var(--os-line-heading-4)' }],
      },
      height: {
        'control-sm': 'var(--os-size-button-sm)',
        'control-md': 'var(--os-size-button-md)',
        'control-lg': 'var(--os-size-button-lg)',
      },
      minHeight: {
        'control-sm': 'var(--os-size-button-sm)',
        'control-md': 'var(--os-size-button-md)',
        'control-lg': 'var(--os-size-button-lg)',
        target: 'var(--os-size-target-preferred)',
      },
      boxShadow: {
        'surface-1': 'var(--os-shadow-surface-1)',
        'surface-2': 'var(--os-shadow-surface-2)',
        'surface-3': 'var(--os-shadow-surface-3)',
        focus: 'var(--os-shadow-focus)',
        image: 'var(--os-shadow-image)',
      },
      transitionDuration: {
        instant: 'var(--os-motion-instant)',
        fast: 'var(--os-motion-fast)',
        normal: 'var(--os-motion-normal)',
        slow: 'var(--os-motion-slow)',
      },
      transitionTimingFunction: {
        standard: 'var(--os-ease-standard)',
        enter: 'var(--os-ease-enter)',
        exit: 'var(--os-ease-exit)',
        emphasis: 'var(--os-ease-emphasis)',
      },
    },
  },
  plugins: [animate],
};

export default config;
