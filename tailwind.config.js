/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#fcf8f7',
        'brand-primary': '#bd6a68',
        'brand-secondary': '#e8c9c7',
        'brand-accent': '#dcc29b',
      }
    },
  },
  plugins: [],
}