import { it } from 'vitest';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { unified } from 'unified';

it('shows mdast for as invocation', () => {
  const content = `<Tabs as |Tab|>
  <Tab @label="Ember">

some content

  </Tab>
</Tabs>`;

  const tree = unified().use(remarkParse).use(remarkGfm, { singleTilde: true }).parse(content);
  console.log(JSON.stringify(tree, null, 2));
});
