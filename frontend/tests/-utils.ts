// const originalOnError = window.onerror;
const hideUpstreamProblems = (error: string | Event) => {
  if (typeof error === 'string') {
    if (error.includes('export')) {
      console.warn('Still waiting on https://github.com/microsoft/vscode/pull/123739');

      return;
    }
  }

  if (error instanceof Error) {
    console.debug(error.message);
    console.debug(error.stack);
  }

  throw error;
};

export function hideUpstreamErrors() {
  window.onerror = hideUpstreamProblems;
  // cleaning up here is too early for firefox :(
  // QUnit.done(() => {
  //   window.onerror = originalOnError;
  // });
}
