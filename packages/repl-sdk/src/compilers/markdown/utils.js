/**
 * @param {string} lang
 */
export function isNotMarkdownLike(lang) {
  return lang !== 'md' && lang !== 'gmd' && lang !== 'mdx';
}

/**
 * @param {string} meta
 */
export function isPreview(meta) {
  if (!meta) return false;

  return meta.includes('preview');
}

/**
 * @param {string} meta
 */
export function isBelow(meta) {
  if (!meta) return false;

  return meta.includes('below');
}

/**
 * @param {import('../../types').PublicMethods} api
 */
export function buildCodeFenceMetaUtils(api) {
  const allowedFormats = api.getAllowedFormats().filter(isNotMarkdownLike);

  /**
   * @param {string} lang
   * @param {string | undefined} [ flavor ]
   */
  function needsLive(lang, flavor) {
    if (!allowedFormats.includes(lang)) return false;

    return api.optionsFor(lang, flavor).needsLiveMeta ?? true;
  }

  /**
   * @param {string} meta
   * @param {string} lang
   * @param {string | undefined} [ flavor ]
   */
  function isLive(meta, lang, flavor) {
    if (!needsLive(lang, flavor)) return true;
    if (!meta) return false;

    return meta.includes('live');
  }

  return {
    isPreview,
    isBelow,
    isLive,
    needsLive,
    allowedFormats,
  };
}
