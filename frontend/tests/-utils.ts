export function setupWindowOnError(hooks: NestedHooks, callback: (error: string | Event) => void) {
  let original: typeof window.onerror;

  hooks.beforeEach(function () {
    original = window.onerror;

    window.onerror = callback;
  });

  hooks.afterEach(function () {
    window.onerror = original;
  });
}
