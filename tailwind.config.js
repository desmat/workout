/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'dark-1': '#264653',
        'dark-2': '#2a9d8f',
        'dark-3': '#92a7a8',
        'light-1': '#e9c46a',
        'light-2': '#f4a261',
        'light-3': '#e76f51',
      },
    },
  },
  plugins: [],
}
