import JSONCrush from 'jsoncrush';

export function encode(text) {
  return JSONCrush.crush(text);
}

export function decode(text) {
  return JSONCrush.uncrush(text);
}
