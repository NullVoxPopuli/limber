export const qunit = {
  codemirror: {
    lang: async () => {},
  },
  resolve: (id) => {
    switch (id) {
      case 'qunit':
        return `https://esm.sh/qunit@3.0.0-alpha.4`;
      case 'qunit.css':
        return `https://cdn.jsdelivr.net/npm/qunit@2.24.2/qunit/qunit.min.css`;
    }
  },
  compiler: async (config, api) => {
    return {
      compile: async (text, options) => {},
      render: async (element, component, extras, compiler) => {
        element.innerHTML = `
          <div id="qunit"></div>
          <div id="qunit-fixture"></div>
          <link href="https://cdn.jsdelivr.net/npm/qunit@2.23.1/qunit/qunit.min.css " rel="stylesheet">
          <style>
             [data-test-compiled-output] {
               padding: 0 !important;
             }
             #qunit {
               position: static;
             }
          </styl>
        `;

        requestAnimationFrame(() => {
          globalThis.QUnit.start();
        });

        return () => {
          /* How do we cleanup?
           * - Can we assure than cleanup happens before the next completion of render?
           * */
        };
      },
    };
  },
};
