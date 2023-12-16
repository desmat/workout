/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-red-50',
    'hover:bg-red-100',
    'active:bg-red-200',
    'text-red-800', 
    'text-red-500',
    'text-red-400',
    'bg-yellow-50',
    'hover:bg-yellow-100',
    'active:bg-yellow-200',
    'text-yellow-800', 
    'text-yellow-500',
    'text-yellow-400',
    'bg-green-50',
    'hover:bg-green-100',
    'active:bg-green-200',
    'text-green-800', 
    'text-green-500',
    'text-green-400',
    'bg-blue-50',
    'hover:bg-blue-100',
    'active:bg-blue-200',
    'text-blue-800', 
    'text-blue-500',
    'text-blue-400',
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
      },
    },
  },
  plugins: [],
}
