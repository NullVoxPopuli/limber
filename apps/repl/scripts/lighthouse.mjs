/**
 * Runs Lighthouse against the production build in ./dist, the same version and
 * categories that pagespeed.web.dev uses.
 *
 *   pnpm build:prod && pnpm lighthouse
 *
 * Options (environment variables):
 *   LIGHTHOUSE_DIST     the folder to serve, default ./dist
 *   LIGHTHOUSE_RUNS     runs for each page, default 3. The median run counts.
 *   LIGHTHOUSE_REPORTS  where the HTML reports go, default ./lighthouse-reports
 *
 * Exit code 1 when an audit of STRICT_CATEGORIES fails, or a budget of BUDGETS with `fail: true`.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';

import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

const DIST = path.resolve(process.env.LIGHTHOUSE_DIST ?? './dist');
const RUNS = Number(process.env.LIGHTHOUSE_RUNS ?? 3);
const REPORTS = path.resolve(process.env.LIGHTHOUSE_REPORTS ?? './lighthouse-reports');

const GJS_DOCUMENT = `import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class Counter extends Component {
  @tracked count = 0;

  increment = () => this.count++;

  <template>
    <p>Count: {{this.count}}</p>
    <button {{on "click" this.increment}}>+1</button>
  </template>
}
`;

const PAGES = [
  { name: 'edit (welcome document)', path: '/edit' },
  { name: 'edit (gjs document)', path: `/edit?format=gjs&t=${encodeURIComponent(GJS_DOCUMENT)}` },
  { name: 'docs', path: '/docs' },
];

/**
 * Each audit in these categories must pass. A new failure stops CI.
 * What we ship decides these results, not the speed of the CI machine.
 */
const STRICT_CATEGORIES = ['accessibility', 'best-practices', 'seo', 'agentic-browsing'];

/**
 * Failures that we know about and accept, with the reason.
 */
const KNOWN_FAILURES = {
  // tabster puts focusable aria-hidden elements in <body>. They move focus away at once.
  // The tabster option that removes them (controlTab: false) breaks the single tab stop
  // of the format switcher.
  'aria-hidden-focus': 'tabster',
  'agent-accessibility-tree': 'tabster',
};

/**
 * `fail: false` only warns, because the performance score and its timings
 * change with the speed of the machine.
 */
const BUDGETS = [
  {
    label: 'CLS',
    fail: true,
    max: 0.1,
    read: (r) => r.audits['cumulative-layout-shift'].numericValue,
  },
  { label: 'Transfer (kB)', fail: true, max: 1800, read: transferKB },
  { label: 'Performance', fail: false, min: 0.7, read: (r) => r.categories.performance.score },
  {
    label: 'TBT (ms)',
    fail: false,
    max: 300,
    read: (r) => r.audits['total-blocking-time'].numericValue,
  },
];

const COLUMNS = [
  { label: 'Perf', read: (r) => percent(r.categories.performance.score) },
  { label: 'A11y', read: (r) => percent(r.categories.accessibility.score) },
  { label: 'BP', read: (r) => percent(r.categories['best-practices'].score) },
  { label: 'SEO', read: (r) => percent(r.categories.seo.score) },
  { label: 'Agentic', read: (r) => percent(r.categories['agentic-browsing']?.score) },
  { label: 'FCP', read: (r) => r.audits['first-contentful-paint'].displayValue },
  { label: 'LCP', read: (r) => r.audits['largest-contentful-paint'].displayValue },
  { label: 'TBT', read: (r) => r.audits['total-blocking-time'].displayValue },
  { label: 'CLS', read: (r) => r.audits['cumulative-layout-shift'].displayValue },
  { label: 'Transfer', read: (r) => `${transferKB(r)} kB` },
];

function percent(score) {
  return score == null ? 'n/a' : String(Math.round(score * 100));
}

function transferKB(report) {
  let bytes = 0;

  for (const item of report.audits['network-requests'].details.items) {
    bytes += item.transferSize;
  }

  return Math.round(bytes / 1024);
}

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
};

/**
 * Close to Cloudflare Pages: brotli, and index.html for a path with no file.
 */
function serve() {
  const cache = new Map();

  function load(file) {
    if (cache.has(file)) return cache.get(file);

    const raw = fs.readFileSync(file);
    const type = TYPES[path.extname(file)];
    const compress = Boolean(type) && type !== 'image/x-icon';
    const body = compress
      ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })
      : raw;
    const entry = { body, compress, type: type ?? 'application/octet-stream' };

    cache.set(file, entry);

    return entry;
  }

  const server = http.createServer((request, response) => {
    const url = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = path.join(DIST, url);

    if (!file.startsWith(DIST)) file = DIST;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) file = path.join(DIST, 'index.html');

    const { body, compress, type } = load(file);

    response.setHeader('content-type', type);
    response.setHeader('cache-control', 'public, max-age=14400, must-revalidate');
    if (compress) response.setHeader('content-encoding', 'br');
    response.end(body);
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function run(url) {
  // A fresh Chrome for each run, so that no run has a warm cache.
  const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });

  try {
    const result = await lighthouse(url, { port: chrome.port, output: 'html', logLevel: 'error' });

    return { report: result.lhr, html: result.report };
  } finally {
    chrome.kill();
  }
}

function median(results) {
  const sorted = results
    .slice()
    .sort((a, b) => a.report.categories.performance.score - b.report.categories.performance.score);

  return sorted[Math.floor(sorted.length / 2)];
}

function check(page, report) {
  const problems = [];

  for (const id of STRICT_CATEGORIES) {
    for (const ref of report.categories[id]?.auditRefs ?? []) {
      const audit = report.audits[ref.id];

      // Lighthouse gives weight 0 to audits that do not count toward the category score.
      if (ref.weight === 0) continue;
      if (audit.score === null || audit.score === 1) continue;
      if (audit.scoreDisplayMode === 'informative' || audit.scoreDisplayMode === 'manual') continue;
      if (ref.id in KNOWN_FAILURES) continue;

      problems.push({ fail: true, text: `${page.name}: ${id} audit "${ref.id}": ${audit.title}` });
    }
  }

  for (const budget of BUDGETS) {
    const value = budget.read(report);
    const ok = budget.min !== undefined ? value >= budget.min : value <= budget.max;

    if (ok) continue;

    const limit = budget.min !== undefined ? `at least ${budget.min}` : `at most ${budget.max}`;

    problems.push({
      fail: budget.fail,
      text: `${page.name}: ${budget.label} is ${Math.round(value * 100) / 100}, expected ${limit}`,
    });
  }

  return problems;
}

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  throw new Error(`No build in ${DIST}. Run "pnpm build:prod" first.`);
}

fs.mkdirSync(REPORTS, { recursive: true });

const server = await serve();
const origin = `http://127.0.0.1:${server.address().port}`;
const lines = [];
const problems = [];

lines.push(`| Page | ${COLUMNS.map((column) => column.label).join(' | ')} |`);
lines.push(`| --- | ${COLUMNS.map(() => '---').join(' | ')} |`);

for (const page of PAGES) {
  const results = [];

  for (let i = 0; i < RUNS; i++) {
    console.error(`${page.name}: run ${i + 1} of ${RUNS}`);
    results.push(await run(origin + page.path));
  }

  const { report, html } = median(results);
  const file = `${page.name.replace(/[^a-z0-9]+/gi, '-').replace(/-$/, '')}.html`;

  fs.writeFileSync(path.join(REPORTS, file), html);
  lines.push(`| ${page.name} | ${COLUMNS.map((column) => column.read(report)).join(' | ')} |`);

  for (const problem of check(page, report)) {
    problems.push(problem);
  }
}

server.close();

const version = JSON.parse(
  fs.readFileSync(new URL(import.meta.resolve('lighthouse/package.json')), 'utf8')
).version;

lines.push('');
lines.push(
  `Lighthouse ${version}, mobile, simulated slow 4G, median of ${RUNS} runs. The timings are simulated, so compare them with other CI runs, not with pagespeed.web.dev.`
);

let failed = false;

if (problems.length) {
  lines.push('');

  for (const problem of problems) {
    failed ||= problem.fail;
    lines.push(`- ${problem.fail ? 'FAIL' : 'warning'}: ${problem.text}`);
  }
}

const summary = lines.join('\n');

console.log(summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Lighthouse\n\n${summary}\n`);
}

if (failed) process.exitCode = 1;
