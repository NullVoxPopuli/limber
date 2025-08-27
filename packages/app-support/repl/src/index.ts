import { syntaxHighlighting } from '@codemirror/language';
import { getCompiler } from 'ember-repl';
import { HorizonSyntaxTheme, HorizonTheme } from './theme.ts';

export { setupCompiler, getCompiler } from 'ember-repl';

export async function getCodeMirror(
  context: object,
  options: {
    element: HTMLElement;
    value: string | null;
    formatFromURL: string;
    updateText: (text: string) => void;
  }
) {
  const compiler = getCompiler(context);

  return await compiler.createEditor(options.element, {
    text: options.value,
    format: options.formatFromURL,
    handleUpdate: options.updateText,
    extensions: [HorizonTheme, syntaxHighlighting(HorizonSyntaxTheme)],
  });
}
