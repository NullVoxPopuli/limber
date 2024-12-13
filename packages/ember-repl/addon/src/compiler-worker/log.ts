export function debug(...msg: Parameters<typeof console.debug>) {
  console.debug(`[Worker]`, ...msg);
}
