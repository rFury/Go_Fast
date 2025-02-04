/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  mode: "jit",
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        sm: '4px',
      },
      colors: {
        'delivery-blue': '#2563eb',
        'delivery-teal': '#0d9488',
      }
    }
  },
  plugins: [],
}

