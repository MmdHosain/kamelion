/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazir', 'Vazirmatn', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        bgLight: 'var(--bg-light)',
        bgDark: 'var(--bg-dark)',
        textDark: 'var(--text-dark)',
      },
      keyframes: {
        fadeSlide: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        messageIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeSlide: 'fadeSlide 0.6s ease-out forwards',
        messageIn: 'messageIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
