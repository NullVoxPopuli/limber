import JSONCrush from 'jsoncrush'
import * as huffman from '@algorithm.ts/huffman'
import base64 from '@algorithm.ts/base64'
import {filesize} from "filesize";
import LZString from 'lz-string';

import { originalText } from './data.js'

const size = (str) => filesize(str.length, { base: 2, standard: "jedec"})

const names = {
  original: 'original',
  lzString: 'lz-string',
  JSONCrush: 'JSONCrush',
  huffman: 'Huffman',
}

// Impact to bundle via https://bundlejs.com/
const bundleImpact = {
  [names.lzString]: '5.17KB (1.61KB gzip)'
}


console.log(
  [
    ['original', originalText],
    ['JSONCrush', JSONCrush.crush(JSON.stringify({ i: originalText }))],
    ['Huffman', compress(originalText)],
    ['lz-string', LZString.compressToBase64(originalText),
      LZString.compressToEncodedURIComponent(originalText)]

  ].map(([label, text, uriText]) => {
    return `
      ${label}: ${size(text)}
      ${label} as URI: ${size(uriText ?? encodeURIComponent(text))}
    `
  }).join('')
)


/**
  * The Huffman library requires a lot of boilerplate.
  */
function compress(text) {
  const { encodedData, encodingTable } = huffman.encode(text)
  const cipherBuffer = huffman.compress(encodedData)
  const cipherText = base64.encode(cipherBuffer)

  const textEncoder = new TextEncoder('utf-8')
  const encodingTableText = base64.encode(
    textEncoder.encode(JSON.stringify(compressEncodingTable(encodingTable))),
  )
  const result = (encodingTableText + '-' + cipherText)
    .replace(/\//g, '(')
    .replace(/\+/g, ')')
    .replace(/=/g, '_')
  return result
}
function compressEncodingTable(table){
  const entries = Object.entries(table)
    .map(([value, path]) => {
      let p = 1
      for (const x of path) p = (p << 1) | x
      return [value, p]
    })
    .flat()
  return entries
}
