// const originalOnError = window.onerror;
const hideUpstreamProblems = (error: string) => {
  if (error.includes('export')) {
    console.warn('Still waiting on https://github.com/microsoft/vscode/pull/123739');

    return;
  }

  console.error(error);
  throw error;
};

export function hideUpstreamErrors() {
  window.onerror = hideUpstreamProblems;
  // cleaning up here is too early for firefox :(
  // QUnit.done(() => {
  //   window.onerror = originalOnError;
  // });
}
