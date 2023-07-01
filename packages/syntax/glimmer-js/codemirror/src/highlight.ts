import { styleTags, tags as t } from '@lezer/highlight';

export const templateTagHighlighting = styleTags({
  TagName: t.tagName,
  GlimmerTemplateTag: t.tagName,
  TemplateTag: t.tagName,
  Template: t.tagName,
});
