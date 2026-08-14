import { describe, expect, it } from 'vitest';

import { filterOptions } from './markdown.js';

describe('filterOptions', () => {
  it('returns empty plugin lists for a non-record', () => {
    expect(filterOptions(undefined)).to.deep.equal({ remarkPlugins: [], rehypePlugins: [] });
  });

  it('passes plugin lists through', () => {
    const remark = () => {};
    const rehype = () => {};

    const result = filterOptions({ remarkPlugins: [remark], rehypePlugins: [rehype] });

    expect(result.remarkPlugins).to.deep.equal([remark]);
    expect(result.rehypePlugins).to.deep.equal([rehype]);
  });

  it('passes headingId through, so it reaches the compiler', () => {
    // Without this, `headingId` is silently dropped between the public `md`
    // compiler and `parseMarkdown`, and the option only works for callers
    // reaching into `buildCompiler` directly.
    expect(filterOptions({ headingId: { slug: 'gfm' } }).headingId).to.deep.equal({ slug: 'gfm' });
  });

  it('leaves headingId undefined when not given', () => {
    expect(filterOptions({}).headingId).toBe(undefined);
  });
});
