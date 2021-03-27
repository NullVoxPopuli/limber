import HBS from 'remark-hbs';
import html from 'remark-html';
import markdown from 'remark-parse';
import unified from 'unified';

const markdownCompiler = unified().use(markdown).use(HBS).use(html);

export const compileMarkdown = (text: string) => markdownCompiler.processSync(text).toString();
