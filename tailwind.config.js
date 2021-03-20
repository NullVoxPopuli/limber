'use strict';

const colors = require('tailwindcss/colors')

module.exports = {
  purge: [
    'app/**/*.{js,ts,hbs}',
  ],
  darkMode: false,
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      ...colors,

      ember: {
        // https://emberjs.com/images/brand/Ember-Brand-Guidelines.pdf
        brand: '#E04E39',
        black: '#212121',
        'burnt-ember': '#9b2918',
        gray: '#817f7f',
        blue: '#1e719b',
        'faint-gray': '#efebea',
        'light-blue': '#74b0ce',
        linen: '#fdf7f6',
        yellow: '#fbc840',
        white: '#fdfdfd',
      }
    },
    fontFamily: {
      'sans': ['system-ui', 'Helvetica', 'Arial', 'sans-serif'],
    },
    extend: {
      minWidth: {
        '1/3': '33%',
      },
      gridTemplateRows: {
        'editor': 'min-content 1fr',
      }
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography')
  ],
}
