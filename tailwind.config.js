/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0A192F',
          dark: '#0F172A',
          card: '#1E293B',
          cardLight: '#FFFFFF',
          primary: '#2563EB',
          primaryHover: '#1D4ED8',
          purple: '#8B5CF6',
          pink: '#EC4899',
          cream: '#F5F3EE',
          border: 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'equalizer': 'equalizer 1.2s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(37, 99, 235, 0.5)) drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))' },
          '100%': { filter: 'drop-shadow(0 0 25px rgba(37, 99, 235, 0.9)) drop-shadow(0 0 45px rgba(236, 72, 153, 0.6))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        equalizer: {
          '0%': { height: '20%' },
          '50%': { height: '100%' },
          '100%': { height: '40%' },
        },
      },
    },
  },
  plugins: [],
}
