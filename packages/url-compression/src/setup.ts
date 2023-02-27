function getWorker() {
  return new Worker(new URL('./worker', import.meta.url));
}

interface Options {
  onEncoded: (encoded: string) => void;
  onDecoded: (decoded: string) => void;
}

export class UrlCompression {
  #worker: Worker;

  constructor({ onEncoded, onDecoded }: Options) {
    this.#worker = getWorker();

    this.#worker.addEventListener('message', (event) => {
      let { encoded, decoded } = event.data;

      if (encoded) {
        return onEncoded(encoded);
      }

      if (decoded) {
        return onDecoded(decoded);
      }
    });
  }

  encode = (text: string) => this.#worker.postMessage({ action: 'encode', text });
  decode = (encoded: string) => this.#worker.postMessage({ action: 'encode', encoded });
}
