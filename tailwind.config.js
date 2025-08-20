/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hydro-blue': '#4A90E2',
        'hydro-light': '#E3F2FD',
        'hydro-dark': '#1565C0',
      }
    },
  },
  plugins: [],
}