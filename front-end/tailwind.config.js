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
        secondary: '#E6C5CC',
        dark: '#1a2522',
        lightText: '#FAFAF8',
        mutedText: '#6B6E6C'
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
