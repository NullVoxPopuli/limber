import JSONCrush from 'jsoncrush'
import * as huffman from '@algorithm.ts/huffman'
import base64 from '@algorithm.ts/base64'
import {filesize} from "filesize";

import { originalText } from './data.js'

const size = (str) => filesize(str.length, { base: 2, standard: "jedec"})



console.log(
  [
    ['original', originalText],
    ['JSONCrush', JSONCrush.crush(JSON.stringify({ i: originalText }))],
    ['Huffman', compress(originalText)]

  ].map(([label, text]) => {
    return `
      ${label}: ${size(text)}
      ${label} as URI: ${size(encodeURIComponent(text))}
    `
  }).join('')
)

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
