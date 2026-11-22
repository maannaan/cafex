import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          dark: '#1A1412',
          espresso: '#251E1A',
          roast: '#3D2D24',
          wood: '#5C4033',
          warm: '#8B5537',
          copper: '#A36842',
          amber: '#C88B57',
          latte: '#D9B58C',
          cream: '#F4ECE1',
          paper: '#FBF8F2',
          card: '#FFFDF9',
          border: '#E8DFD3',
          borderDark: '#3A2E26',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
