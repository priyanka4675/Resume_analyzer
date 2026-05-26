/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#edfcf4',
          100: '#d3f8e3',
          200: '#aaf0cc',
          300: '#72e2ad',
          400: '#38cc87',
          500: '#14b268',
          600: '#0a9154',
          700: '#097445',
          800: '#0b5c38',
          900: '#0a4c2f',
          950: '#042a1a',
        },
        surface: {
          900: '#080f0c',
          800: '#0d1a14',
          700: '#132419',
          600: '#1a3024',
          500: '#224030',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'score-fill': 'scoreFill 1.5s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        scoreFill: {
          from: { strokeDashoffset: '339.3' },
        }
      }
    },
  },
  plugins: [],
}
