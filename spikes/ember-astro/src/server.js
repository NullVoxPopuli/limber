function check() {
  console.info('not implemented');
}
function renderToStaticMarkup() {
  console.info('not implemented');
}

const renderer = {
  name: 'ember-astro',
  check,
  renderToStaticMarkup,
  supportAstroStaticSlot: true,
};

export default renderer;
