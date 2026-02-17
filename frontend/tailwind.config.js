/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fk: {
          blue: '#2874f0',
          'blue-dark': '#1a5dc9',
          yellow: '#ff9f00',
          teal: '#00bfa5',
          bg: '#f1f3f6',
          border: '#e0e0e0',
        }
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'fk': '0 2px 8px rgba(0,0,0,0.1)',
        'fk-hover': '0 4px 12px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
