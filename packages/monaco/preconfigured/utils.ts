export async function insertStyles(css: string) {
  let hasStyles = document.querySelector(`link[href="${css}]"`);

  if (hasStyles) return;

  let element = document.createElement('link');

  element.setAttribute('rel', 'stylesheet');
  element.setAttribute('href', css);

  document.body.appendChild(element);
  await Promise.resolve();
}
