/**
 * Initial checksum value, includes the 8 bytes in the checksum field itself
 * @type {number}
 */
export const INITIAL_CHKSUM = 8 * 32;
export const RECORD_SIZE = 512;
export const encoder = new TextEncoder();

/**
 * Calculates the checksum from the first 512 bytes of a buffer
 * @param {Uint8Array} buf
 * @returns {number}
 */
export function getChecksum(buf) {
  let checksum = INITIAL_CHKSUM;

  for (let i = 0; i < RECORD_SIZE; i++) {
    // Ignore own checksum field
    if (i >= 148 && i < 156) {
      continue;
    }

    checksum += buf[i];
  }

  return checksum;
}

/**
 * Writes a string into an array buffer at a given offset, with a size limit
 * @param {ArrayBuffer} buf
 * @param {string} str
 * @param {number} offset
 * @param {number} size
 * @returns {void}
 */
export function writeString(buf, str, offset, size) {
  const view = new Uint8Array(buf, offset, size);

  encoder.encodeInto(str, view);
}

/**
 * Formats numbers for an octal-typed field
 * @param {number} input
 * @param {number} length
 * @returns {string}
 */
export function formatOctal(input, length) {
  return input.toString(8).padStart(length, '0');
}
