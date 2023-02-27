import * as LZString from 'lz-string';

function encode(text: string) {
  return LZString.compressToBase64(text);
}

function decode(text: string) {
  return LZString.decompressFromBase64(text)
}

let last: number;
function queueEncode(text: string) {
  if (last) {
    cancelIdleCallback(last);
  }

  last = requestIdleCallback(() => {
    let encoded = encode(text);

    globalThis.postMessage({ encoded });
  });
}



globalThis.addEventListener('message', (event) => {
  let { action } = event.data;

  switch (action) {
    case 'encode': 
      /**
       * Since typing can be quick, we don't want to do more work that we have to.
       */
      return queueEncode(event.data.text);
    case 'decode': {
      // Decoding is *way* faster than encoding, so 
      // we can immediately send the message back
      let decoded = decode(event.data.encoded);

      globalThis.postMessage(({
        decoded
      }))
    }
  }
}); 
