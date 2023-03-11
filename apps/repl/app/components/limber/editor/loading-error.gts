import type { TOC } from '@ember/component/template-only';

export const LoadingError: TOC<{
  Args: {
    error?: string
  }
}> = <template><div
  data-test-loading-error
  class='rounded absolute left-4 p-4 top-4 bg-red-100 text-black drop-shadow-md border border-red-700 max-w-[40vw]'
>
  {{!
      We need this log to get the stack trace, otherwise we have no easy to
      see what happen that caused the StateMachine to error
    }}
  {{! template-lint-disable no-log }}
  {{log @error}}
  <pre class='whitespace-pre-wrap'>{{@error}}</pre>
</div></template>
