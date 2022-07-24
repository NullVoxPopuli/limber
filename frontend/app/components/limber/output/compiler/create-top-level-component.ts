import { type ComponentLike } from '@glint/template';
import { nameFor } from 'ember-repl';
import { type Format } from 'limber/utils/messaging';

const CACHE = new Map<string, ComponentLike>();

export async function compileTopLevelComponent(
  text: string,
  {
    format,
    onSuccess,
    onError,
    onCompileStart,
  }: {
    format: Format;
    onSuccess: (component: ComponentLike) => void;
    onError: (error: string) => void;
    onCompileStart: () => void;
  }
) {
  let id = nameFor(text);

  let existing = CACHE.get(id);

  if (existing) {
    onSuccess(existing);

    return;
  }

  const getCompiler = (format: Format) => {
    return {
      glimdown: () => import('./formats/glimdown'),
      gjs: () => import('./formats/gjs'),
      hbs: () => import('./formats/hbs'),
    }[format];
  };

  onCompileStart();

  let compiler = await getCompiler(format)?.();

  if (!compiler) {
    onError('Could not find compiler');

    return;
  }

  if (!text) {
    onError('No Input Document yet');

    return;
  }

  let { error, rootComponent } = await compiler.compile(text);

  if (error) {
    onError(error.message || `${ error }`);

    // let { line } = extractPosition(error.message);

    // this.error = error.message;
    // this.errorLine = line;

    return;
  }

  CACHE.set(id, rootComponent as ComponentLike);

  onSuccess(rootComponent as ComponentLike);
}

// function extractPosition(message: string) {
//   let match = message.match(/' @ line (\d+) : column/);

//   if (!match) {
//     return { line: null };
//   }

//   let [, line] = match;

//   return { line: parseInt(line, 10) };
// }
