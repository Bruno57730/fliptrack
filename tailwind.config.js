/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        warm: {
          50: '#faf5f0',
          100: '#f5ebe0',
          200: '#ede2d7',
          300: '#e1cfc0',
          400: '#d1b8a4',
          500: '#c2a08a',
          600: '#a88570',
          700: '#8b6f5c',
          800: '#6b5349',
          900: '#5a463a',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
