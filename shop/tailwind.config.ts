import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          bg: '#fafaf8',
          card: '#ffffff',
          border: '#e7e5e4',
          gold: '#b8943f',
          purple: '#b8943f',
          muted: '#6b7280',
          primary: '#171717',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Noto Serif SC', 'serif'],
        sans: ['Inter', 'Noto Sans SC', 'PingFang SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
