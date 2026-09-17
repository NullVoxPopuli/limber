/**
 * Babel 8 reads the `process` global of node.
 * The bundle gets this object in its place, so that it needs nothing from the page.
 */
export default {
  env: {},
  cwd: () => '/',
  versions: { node: '24.0.0' },
  exit() {},
};
