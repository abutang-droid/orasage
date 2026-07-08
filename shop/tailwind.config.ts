import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
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
        placeholder: withOpacity('--placeholder'),
        brand: {
          primary: withOpacity('--brand-primary'),
          gold: withOpacity('--brand-gold'),
          purple: withOpacity('--brand-purple'),
        },
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
      },
      fontFamily: {
        sans: ['var(--os-font-sans)'],
        serif: ['var(--os-font-serif-zh)'],
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
      },
    },
  },
  plugins: [animate],
};

export default config;
