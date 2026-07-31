/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        soc: {
          bg: '#09111F',
          secondary: '#0F172A',
          card: '#111827',
          elevated: '#162133',
          border: '#243244',
          accent: '#10B981',
          'accent-hover': '#34D399',
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#3B82F6',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        brand: {
          500: '#10B981',
          400: '#34D399',
        }
      },
      boxShadow: {
        soc: '0 10px 30px rgba(0, 0, 0, 0.25)',
        'soc-glow': '0 0 0 1px rgba(16, 185, 129, 0.15), 0 10px 35px rgba(16, 185, 129, 0.08)',
      }
    },
  },
  plugins: [],
}
