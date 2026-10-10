export interface Options {
  /**
   * Which files are markdown documents.
   * Default: files that end in `.gjs.md`
   */
  include?: RegExp;
  /**
   * Import statements, as text.
   * The prose and the hbs demos can use what they import.
   */
  imports?: string;
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
}

/**
 * Compiles markdown documents to components when the app builds.
 * Each live code fence in a document is a component in the same module.
 */
export function emberRepl(options?: Options): {
  name: string;
  enforce: 'pre';
  configResolved(config: { root: string }): void;
  load(id: string): Promise<{ code: string; map: unknown } | undefined>;
};
