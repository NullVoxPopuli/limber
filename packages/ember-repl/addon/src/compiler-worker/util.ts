export function getString(obj: object, key: string): string | undefined {
  if (obj === null) return;

  if (key in obj) {
    let value = obj[key as keyof typeof obj];

    if (typeof value === 'string') {
      return value;
    }
  }
}
