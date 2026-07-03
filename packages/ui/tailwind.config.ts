import type { Config } from 'tailwindcss';
import { orasageTailwindPreset } from '@orasage/tokens/tailwind-preset';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [orasageTailwindPreset as Config],
};

export default config;
