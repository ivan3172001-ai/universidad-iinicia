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
        iinicia: {
          navy: '#060e26',    // Azul marino oscuro tecnológico (Header / Hero)
          primary: '#0066ff', // Azul eléctrico principal (Botones / Acentos)
          teal: '#00b4d8',    // Cian brillante del logo i² INICIA
          light: '#ebf5ff',   // Azul hielo claro para secciones destacadas
          gold: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
