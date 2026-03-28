/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        casino: {
          gold: '#FFD700',
          green: '#00FF00',
          red: '#FF0000',
          dark: '#1a1a1a',
          darker: '#0f0f0f'
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite'
      }
    },
  },
  plugins: [],
}