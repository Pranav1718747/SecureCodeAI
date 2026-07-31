/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#14532d',
        }
      }
    },
  },
  plugins: [],
}
