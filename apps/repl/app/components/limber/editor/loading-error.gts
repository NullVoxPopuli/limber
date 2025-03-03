import type { TOC } from '@ember/component/template-only';

export const LoadingError: TOC<{
  Args: {
    error?: string;
  };
}> = <template>
  <div
    data-test-loading-error
    class="absolute left-4 top-4 max-w-[40vw] rounded border border-red-700 bg-red-100 p-4 text-black drop-shadow-md"
  >
    {{!
      We need this log to get the stack trace, otherwise we have no easy to
      see what happen that caused the StateMachine to error
    }}
    {{! template-lint-disable no-log }}
    {{log @error}}
    <pre class="whitespace-pre-wrap">{{@error}}</pre>
  </div>
</template>;
