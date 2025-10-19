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
      render: async (element, component, extras, compiler) => {},
    };
  },
};
