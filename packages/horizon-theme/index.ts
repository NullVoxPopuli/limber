export const syntax = {
  lavender: '#B877DB',
  cranberry: '#E95678',
  turquoise: '#25B0BC',
  apricot: '#F09483',
  rosebud: '#FAB795',
  tacao: '#FAC29A',
  gray: '#BBBBBB',
} as const;

export const ui = {
  shadow: '#161e2b',
  border: '#1a2332',
  /**
   * I wanted a slightly darker background, so instead
   * of using the Horizon default background, this is
   * now bg-gray-800 from the default tailwind theme
   */
  background: '#27272a',
  backgroundAlt: '#252f41',
  accent: '#323c4d',
  accentAlt: '#4d5664',
  secondaryAccent: '#E9436D',
  secondaryAccentAlt: '#E95378',
  tertiaryAccent: '#FAB38E',
  positive: '#09F7A0',
  negative: '#F43E5C',
  warning: '#27D797',
  modified: '#21BFC2',
  lightText: '#D5D8DA',
  darkText: '#06060C',
} as const;

export const alpha = {
  high: 'E6',
  highMed: 'B3',
  med: '80',
  medLow: '4D',
  low: '1A',
  none: '00',
} as const;
