/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          bg: '#0f0e17',
          card: '#1a1928',
          border: '#2e2d42',
          gold: '#c9a962',
          purple: '#7f5af0',
          muted: '#a7a9be',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Noto Serif SC', 'serif'],
      },
    },
  },
  plugins: [],
};
