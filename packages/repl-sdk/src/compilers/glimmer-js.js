import { esmsh, jsdelivr } from './cdn.js';

/**
 * @param {import('../types.ts').ResolvedCompilerOptions} config
 * @param {import('../types.ts').PublicMethods} api
 */
export async function compiler(config = {}, api) {
  const versions = config.versions || {};

  const [
    babel,
    templatePlugin,
    { default: templateCompiler },
    { Preprocessor },
    { default: MacrosPlugin },
    { MacrosConfig },
  ] = await esmsh.importAll(versions, [
    /**
     * The only version of babel that is easily runnable in the browser
     * This includes way too much stuff.
     */
    '@babel/standalone',
    /**
     * Babel plugin that understands all the different ways
     * which templates have been authored and what they need to
     * compile to over the years.
     */
    'babel-plugin-ember-template-compilation',
    /**
     * The actual template-compiler is ember-sounce-dependent,
     * because the underlying format / bytecodes / etc is private,
     * and can change between versions of ember-source.
     */
    'ember-source/dist/ember-template-compiler.js',
    /**
     * Converts gjs/gts to standard js/ts
     */
    'content-tag',
    /**
     * Build-time macros
     * (partly because import.meta.env.DEV isn't standard
     *   partly because we needed more than what meta.env could offer)
     */
    '@embroider/macros/src/babel/macros-babel-plugin.js',
    '@embroider/macros/src/node.js',
    // Failed to load (will need to PR for browser support),
    //   so we have to use babel's decorator transforms,
    //   which ... aren't great.
    //   They force over-transforming of classes.
    // 'decorator-transforms',
  ]);

  const preprocessor = new Preprocessor();

  return {
    resolve: (id) => {
      if (id.startsWith('@ember')) {
        return `https://esm.sh/*ember-source/dist/packages/${id}`;
      }
      if (id.startsWith('@glimmer')) {
        return `https://esm.sh/*ember-source/dist/dependencies/${id}.js`;
      }

      // if (id.startsWith('@embroider/macros')) {
      //   return `https://esm.sh/*@embroider/macros/src/addon/runtime.js`;
      // }
    },
    compile: async (text) => {
      let preprocessed = preprocessor.process(text, 'dynamic-repl.js');
      let transformed = await transform({ babel, templatePlugin, templateCompiler }, preprocessed);

      let code = transformed.code;
      console.log(code);
      return code;
    },
    render: async (element, compiled, extra, compiler) => {
      element.innerHTML = compiled.toString();
    },
  };
}

async function transform({ babel, templatePlugin, templateCompiler }, text) {
  console.log(templateCompiler, templatePlugin);
  return babel.transform(text, {
    filename: `dynamic-repl.js`,
    plugins: [
      [
        templatePlugin,
        {
          compiler: templateCompiler,
        },
      ],
      [MacrosPlugin, MacrosConfig.for({}, 'dynamic-directory')],
      // [babel.availablePlugins['proposal-decorators'], { legacy: true }],
      // [babel.availablePlugins['proposal-class-properties']],
    ],
    presets: [
      [
        babel.availablePresets['env'],
        {
          // false -- keeps ES Modules
          modules: false,
          targets: { esmodules: true },
          forceAllTransforms: false,
        },
      ],
    ],
  });
}
