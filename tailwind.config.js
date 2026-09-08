/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0e692e',
          'primary-hover': '#0a5224',
          'primary-light': '#eef7f2',
          'primary-border': '#c7ecd5',
          blue: '#0e692e',
          'blue-hover': '#0a5224',
          'blue-light': '#eef7f2',
          green: '#059669',
          'green-light': '#ECFDF5',
          'green-badge': '#DCFCE7',
          dark: '#0B1324',
          'dark-card': '#1E293B',
          'dark-navy': '#0F172A',
          bg: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
