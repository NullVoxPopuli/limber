'use strict';

const path = require('path');
const colors = require('tailwindcss/colors');

const appRoot = path.join(__dirname, '../../frontend');

module.exports = {
  content: [`${appRoot}/app/**/*.{js,ts,hbs,gjs,gts}`, `${appRoot}/public/**/*.md`],
  theme: {
    variants: {
      xs: '465px',
      // => @media (min-width: 465px) { ... }
      sm: '640px',
      // => @media (min-width: 640px) { ... }
      lg: '1024px',
      // => @media (min-width: 1024px) { ... }
      'until-lg': { max: '1023px' },
      // => @media (max-width: 1023px) { ... }
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      ...colors,

      ember: {
        brand: 'var(--ember-brand)',
        black: 'var(--ember-black)',
        'burnt-ember': 'var(--ember-burnt-ember)',
        gray: 'var(--ember-gray)',
        blue: 'var(--ember-blue)',
        'faint-gray': 'var(--ember-faint-gray)',
        'light-blue': 'var(--ember-light-blue)',
        linen: 'var(--ember-linen)',
        yellow: 'var(--ember-yellow)',
        white: 'var(--ember-white)',
      },
    },
    fontFamily: {
      sans: ['system-ui', 'Helvetica', 'Arial', 'sans-serif'],
      mono: [
        'ui-monospace',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe WPC',
        'Segoe UI',
        'HelveticaNeue-Light',
        'Ubuntu',
        'Droid Sans',
        'sans-serif',
      ],
    },
    extend: {
      minWidth: {
        '1/3': '33%',
        3: '0.75rem',
      },
      gridTemplateRows: {
        editor: 'min-content 1fr',
        main: '1fr 1.5fr',
      },
      gridTemplateColumns: {
        main: '1fr 1.5fr',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
