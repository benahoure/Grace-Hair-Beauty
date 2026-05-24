import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6F0',
        'cream-deep': '#F2EAE0',
        'cream-border': '#E4D9CE',
        cocoa: '#2C1810',
        espresso: '#3D2314',
        mocha: '#6B4226',
        latte: '#A07850',
        gold: '#B8860B',
        'gold-light': '#D4A843',
        'gold-pale': '#F0E0B0',
        'gold-dark': '#8B6200',
        terracotta: '#C08060',
        blush: '#EDD5C0',
        paper: '#FFFDF9',
        ink: '#1A0F09',
        success: '#3A6B44',
        error: '#9B2020',
        warning: '#8B5A00',
        info: '#2C5F7A',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        editorial: '0 12px 40px rgba(44, 24, 16, 0.10)',
        soft: '0 2px 8px rgba(44, 24, 16, 0.06)',
      },
      borderRadius: {
        card: '4px',
      },
    },
  },
  plugins: [],
}

export default config
