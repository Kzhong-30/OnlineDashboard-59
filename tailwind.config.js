/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      }
    },
    extend: {
      colors: {
        'bake': {
          50: '#FFF8E7',
          100: '#FDEBC8',
          200: '#F9D894',
          300: '#F4A460',
          400: '#E8883D',
          500: '#D2691E',
          600: '#B8551A',
          700: '#8B4513',
          800: '#6B3410',
          900: '#4A230B',
        },
        'cream': '#FFF8E7',
        'caramel': '#D2691E',
        'wheat': '#F4A460',
        'cocoa': '#8B4513',
        'matcha': '#8FBC8F',
      },
      fontFamily: {
        display: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        body: ['"Noto Sans SC"', '"Source Han Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'bake': '0 4px 20px rgba(210, 105, 30, 0.15)',
        'bake-hover': '0 8px 30px rgba(210, 105, 30, 0.25)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
