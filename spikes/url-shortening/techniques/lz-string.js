import LZString from 'lz-string';

export function encode(text) {
  return LZString.compressToBase64(text);
}

export function decode(text) {
  return LZString.decompressFromBase64(text)
}
