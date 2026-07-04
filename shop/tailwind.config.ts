import type { Config } from 'tailwindcss';

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: withOpacity('--background'),
        foreground: withOpacity('--foreground'),
        border: withOpacity('--border'),
        primary: {
          DEFAULT: withOpacity('--primary'),
          foreground: withOpacity('--primary-foreground'),
        },
        muted: {
          DEFAULT: withOpacity('--muted'),
          foreground: withOpacity('--muted-foreground'),
        },
        sage: {
          bg: 'var(--orasage-background)',
          card: 'var(--orasage-surface)',
          border: 'var(--orasage-border)',
          gold: 'var(--orasage-primary)',
          purple: 'var(--orasage-primary)',
          muted: 'var(--orasage-muted)',
          primary: 'var(--orasage-primary)',
        },
      },
      fontFamily: {
        serif: ['var(--os-font-serif-zh)', 'Noto Serif SC', 'serif'],
        sans: ['var(--os-font-sans)', 'Noto Sans SC', 'PingFang SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
