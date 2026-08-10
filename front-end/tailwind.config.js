/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        gold: '#d4af37', // Mocking the luxury clinic feel
        primary: '#2F5D50',
        primaryLight: '#264C42',
        primaryHover: '#234840',
        primaryMuted: '#8FA9A3',
        primaryPale: '#D1EAE3',
        primaryGhost: '#f0f7f4',
        secondary: '#E6C5CC',
        secondaryHover: '#d9b2bb',
        secondaryLight: '#f2dde3',
        secondaryMuted: '#E9C9CD',
        dark: '#1a2522',
        darkGray: '#2B2B2B',
        lightText: '#FAFAF8',
        mutedText: '#6B6E6C',
        textDark: '#3B3D3B',
        chatBg: {
          100: '#0f1715',
          200: '#0a110f',
          300: '#111c18'
        }
      },
      keyframes: {
        fadeSlide: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        messageIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeSlide: 'fadeSlide 0.8s ease-out forwards',
        messageIn: 'messageIn 0.2s ease-out',
      }
    },
  },
  plugins: [],
}
