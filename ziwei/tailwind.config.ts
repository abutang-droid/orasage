import type { Config } from 'tailwindcss';
import orasageTailwindPreset from '@orasage/tokens/tailwind-preset';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [orasageTailwindPreset],
  theme: {
    extend: {
      colors: {
        // Layout neutrals — bound to shared design tokens (DS v1.1)
        bg: {
          0: 'var(--orasage-background)',
          1: 'var(--orasage-surface)',
          2: 'var(--orasage-border)',
          inv: 'var(--orasage-primary)',
        },
        tx: {
          0: 'var(--orasage-primary)',
          1: 'var(--orasage-primary)',
          2: 'var(--orasage-muted)',
          3: 'var(--orasage-muted)',
          inv: 'var(--orasage-background)',
        },
        ac: {
          DEFAULT: 'var(--orasage-gold)',
          dim: 'var(--orasage-gold-light)',
        },
        // 四化语义色（紫微专属，保留）
        lu: '#2D7A4A',
        quan: '#1A56A8',
        ke: '#8A7018',
        ji: '#A83228',
      },
      fontFamily: {
        sans: ['var(--font)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.05)',
        sm: '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        md: '0 4px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)',
        lg: '0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        pill: '999px',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
