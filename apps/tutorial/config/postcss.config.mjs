import path from 'node:path';

import theme from '@nullvoxpopuli/limber-styles';
import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
import tailwind from 'tailwindcss';

const appRoot = path.join(import.meta.dirname, '..');

export default {
  plugins: [postcssImport(), tailwind(theme(appRoot)), autoprefixer()],
};
