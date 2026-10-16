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
        pinkHalo: {
          '0%': { boxShadow: '0 0 0 0 rgba(231, 84, 128, 0)' },
          '25%': { boxShadow: '0 0 0 5px rgba(231, 84, 128, 0.45), 0 0 18px 4px rgba(231, 84, 128, 0.35)' },
          '60%': { boxShadow: '0 0 0 4px rgba(231, 84, 128, 0.25), 0 0 12px 2px rgba(231, 84, 128, 0.2)' },
          '100%': { boxShadow: '0 0 0 0 rgba(231, 84, 128, 0)' },
        },
      },
      animation: {
        fadeSlide: 'fadeSlide 0.6s ease-out forwards',
        messageIn: 'messageIn 0.2s ease-out',
        'pink-halo': 'pinkHalo 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
