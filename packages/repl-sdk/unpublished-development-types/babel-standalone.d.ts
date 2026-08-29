/**
 * `@babel/standalone` ships no types. Only the surface `render-to-string.js`
 * uses is declared here; the module is otherwise opaque.
 */
declare module '@babel/standalone' {
  export interface BabelStandalone {
    /** `@babel/types`, `parser`, `generator`, `traverse`, `template` */
    packages: Record<string, unknown>;
    transform(
      code: string,
      options?: Record<string, unknown>
    ): { code?: string | null } | null | undefined;
  }

  const babel: BabelStandalone;

  export default babel;
}
