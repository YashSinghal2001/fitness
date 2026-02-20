/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#292966', // Dark base background
        surface: 'rgba(41, 41, 102, 0.8)', // Cards with glass effect (base is #292966)
        primary: '#5C5C99', // Primary brand color
        secondary: '#A3A3CC', // Secondary accent
        highlight: '#CCCCFF', // Light highlight color
        muted: 'rgba(204,204,255,0.6)', // Muted text
        success: '#CCCCFF', // Lighter tint of highlight
        warning: '#A3A3CC', // Mix of secondary
        critical: '#4B4B7F', // Darker shade of primary
        border: 'rgba(204,204,255,0.2)', // Border color
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(92, 92, 153, 0.4), 0 2px 4px -1px rgba(92, 92, 153, 0.2)',
        'glow': '0 0 15px rgba(92, 92, 153, 0.6)',
      },
    },
  },
  plugins: [],
}
