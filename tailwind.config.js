'use strict';

module.exports = {
  purge: [
    'app/**/*.{js,ts,hbs}',
  ],
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography')
  ],
}
