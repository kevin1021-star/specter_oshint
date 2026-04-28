/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00f2ff',
          purple: '#7000ff',
          black: '#050505',
          dark: '#0a0a0f',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(45deg, #00f2ff, #7000ff)',
      }
    },
  },
  plugins: [],
}
