/**
 * Loose on purpose: nothing from `@babel/core` reaches the types of the packages that bundle this.
 */
interface Result {
  code: string;
  map: unknown;
  ast: unknown;
}

export const version: string;
export const availablePlugins: { 'transform-typescript': unknown };
export const availablePresets: { react: unknown };

export function parse(code: string, options?: object): unknown;
export function transform(code: string, options?: object): Result;
export function transformSync(code: string, options?: object): Result;
export function transformAsync(code: string, options?: object): Promise<Result>;
