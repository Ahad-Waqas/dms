/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./src/**/*.{js,ts,jsx,tsx}",
],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['var(--inter)', 'serif'],
        'garamond': ['var(--apple-garamond)', 'serif'],
      },
      fontSize: {
        'hero': 'clamp(4.5rem, -0.875rem + 8.333vw, 9.5rem)',
      },
      lineHeight: {
        '95': '0.95',
        '150': '1.5',
      },
    },
  },
  plugins: [],
}