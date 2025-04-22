/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    colors: {
      black: {
        primary: '#121212',
        secondary: '#1E1E1E',
        pure: '#000000'
      },
      gold: {
        primary: '#D4AF37',
        secondary: '#FFD700',
        light: '#F0E6C2'
      },
      cream: '#F5F5F5',
      gray: {
        dark: '#333333',
        medium: '#555555',
        light: '#777777'
      }
    },
    backgroundColor: {
      page: '#F5F5F5',
      card: '#FFFFFF'
    },
    textColor: {
      primary: '#121212',
      secondary: '#333333',
      accent: '#D4AF37'
    },
    borderColor: {
      primary: '#D4AF37',
      secondary: '#333333',
      light: '#E5E5E5'
    }
  },
};
export const plugins = [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
];