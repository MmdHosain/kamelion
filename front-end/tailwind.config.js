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
        dark: '#1a1a1a',
      }
    },
  },
  plugins: [],
}
