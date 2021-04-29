'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const esbuild = require('esbuild');

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

const nm = path.join(__dirname, '../../node_modules/');
const cssLocation = path.join(`${nm}codemirror/lib`);

function codeMirrorFunnel(_options) {
  let css = new Funnel(cssLocation, {
    destDir: 'codemirror/',
    include: ['*.css'],
  });

  return mergeTrees([css]);
}

module.exports = {
  codeMirrorFunnel,
};
