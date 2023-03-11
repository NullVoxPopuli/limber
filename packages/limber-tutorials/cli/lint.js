#!/usr/bin/node
// @ts-check

/**
  * Super light-weight linter. does regex matching because these docs files (for now), 
  * are *basic*.
  *
  * In one *.md document, each time there is a `=== gjs ===`, we cut the document.
  *
  * @typedef {{
  *   message: string;
  *   filePath: string;
  *   severity: 'error' | 'warning' | 'todo'
  * }} Report
  *
  */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import chalk from 'chalk';
import { globbyStream } from 'globby';


let cwd = process.cwd();

/** @type {Report[]} */
let reports = [];

async function lint() {

  for await (let filePath of globbyStream('docs/**/*.md')) {
    await lintFile(filePath.toString());
  } 

  print(reports);
}

/**
  * @param {string} filePath
  */
async function lintFile(filePath) {
  let file = await fs.readFile(filePath, 'utf8');
  let content = file.toString();

  let lines = content.split('\n');

  /**
    * Must have:
    * - at least one code block
    * - valid block separator
    */
  let hasCodeBlock = false;
  for (let line of lines) {
    if (line.match(/^=== gjs ===$/)) {
      hasCodeBlock = true;
    } 
  }

  if (!hasCodeBlock) {
    reports.push({
      filePath,
      message: `Must have at least section marked by the "=== gjs ===" heading to delineate "the code".`,
      severity: 'error',
    })
  }

}

const logger = {
  error: console.error,
  warning: console.warn,
  todo: console.info,
};

const color = {
  error: chalk.red,
  warning: chalk.yellow,
  todo: chalk.blue,
}



/**
  * @param {Report[]} reports
  */
function print(reports) {
  /**
    * Group errors by message, rather than by file
    * This results in less output
    */

  if (process.env[ 'INDIVIDUAL_ERRORS' ]) {
    for (let report of reports) {
      console.log();
      let log = logger[report.severity];
      let localFile = path.relative(cwd, report.filePath)

      console.info(localFile);
      log('\t' + color[report.severity](report.message));
    } 
  } else {
    /** @type {Map<string, Report[]>} */
    let map = new Map();
    /**
      * @param {string} msg
      */
    let ensure = (msg) => {
      let existing = map.get(msg);
      if (existing) return existing;
      existing = [];
      map.set(msg, existing);
      return existing;
    }

    for (let report of reports) {
      let bucket = ensure(report.message);
      bucket.push(report);
    }

    for (let [msg, reports] of map.entries()) {
      console.log();
      logger.error(color.error(msg));
      for (let report of reports) {
        console.info(`\t` + report.filePath);
      }
    }
  }

  if (reports.length > 0) {
    console.log();
    console.error(color.error(`There were ${reports.length} errors!`));
  }
  
}

await lint();
