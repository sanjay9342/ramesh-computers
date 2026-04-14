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
          blue: '#b326b6',
          'blue-dark': '#851d88',
          yellow: '#cb47ca',
          'yellow-dark': '#a72ea8',
          teal: '#e17adf',
          bg: '#fff7fd',
          border: '#efd8ef',
        }
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'fk': '0 12px 30px rgba(133, 29, 136, 0.10)',
        'fk-hover': '0 18px 40px rgba(203, 71, 202, 0.18)',
      }
    },
  },
  plugins: [],
}
