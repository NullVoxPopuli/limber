import { esmsh, jsdelivr } from './cdn.js';

/**
 * @param {import('../types.ts').ResolvedCompilerOptions} config
 * @param {import('../types.ts').PublicMethods} api
 */
export async function compiler(config = {}, api) {
  const versions = config.versions || {};

  const [babel, templatePlugin, { default: templateCompiler }, { Preprocessor }] =
    await esmsh.importAll(versions, [
      '@babel/standalone',
      'babel-plugin-ember-template-compilation',
      'ember-source/dist/ember-template-compiler.js',
      'content-tag',
      // Failed to load (will need to PR for browser support),
      //   so we have to use babel's decorator transforms,
      //   which ... aren't great.
      //   They force over-transforming of classes.
      // 'decorator-transforms',
    ]);

  const preprocessor = new Preprocessor();

  return {
    compile: async (text) => {
      let preprocessed = preprocessor.process(text, 'dynamic-repl.js');
      let transformed = await transform({ babel, templatePlugin, templateCompiler }, preprocessed);

      return transformed.code;
    },
    render: async (element, compiled, extra, compiler) => {
      element.innerHTML = compiled;
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
