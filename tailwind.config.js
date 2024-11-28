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
        'dark-0': '#293241',
        'dark-1': '#3D5A80',
        'dark-2': '#7b90aa',
        'dark-3': '#E0FBFC',
        'light-1': '#e9c46a',
        'light-2': '#f4a261',
        'light-3': '#EE6C4D',
        'light-4': '#a94c36',
      },
    },
  },
  plugins: [],
}
