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
    onSuccess: (component: ComponentLike) => Promise<void>;
    onError: (error: string) => Promise<void>;
    onCompileStart: () => Promise<void>;
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

  await onCompileStart();

  let compiler = await getCompiler(format)?.();

  if (!compiler) {
    await onError('Could not find compiler');

    return;
  }

  if (!text) {
    await onError('No Input Document yet');

    return;
  }

  let { error, rootComponent } = await compiler.compile(text);

  if (error) {
    await onError(error.message || `${error}`);

    return;
  }

  CACHE.set(id, rootComponent as ComponentLike);

  await onSuccess(rootComponent as ComponentLike);
}
