import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dfe9ff',
          500: '#315CF5',
          600: '#214ce4',
          900: '#14243A',
        },
        slate: {
          950: '#0d1727',
        },
      },
      boxShadow: {
        soft: '0 18px 40px -22px rgba(49, 92, 245, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
