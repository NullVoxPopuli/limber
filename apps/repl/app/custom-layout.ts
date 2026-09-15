/**
 * The files for a route live together in app/routes/<name>/
 *
 *   +route.ts       the Route class
 *   +template.gts   the template
 *   +controller.ts  the Controller, only for routes with query params
 *
 * Other files in that folder belong to that route alone.
 *
 * The resolver still looks modules up by the classic layout
 * (routes/, templates/, controllers/), so the module keys are translated here.
 */
const classicDirectories: Record<string, string> = {
  '+route.ts': 'routes',
  '+template.gts': 'templates',
  '+controller.ts': 'controllers',
};

const routeFile = /^\.\/routes\/(.+)\/(\+[a-z]+\.g?ts)$/;

function classicName(path: string) {
  const match = routeFile.exec(path);
  const route = match?.[1];
  const directory = match?.[2] ? classicDirectories[match[2]] : undefined;

  if (!route || !directory) {
    throw new Error(`Unsupported pattern: ${path}`);
  }

  return { route, name: `./${directory}/${route}` };
}

export function customLayout(globbed: Record<string, unknown>) {
  const result: Record<string, unknown> = {};

  for (const [path, module] of Object.entries(globbed)) {
    result[classicName(path).name] = module;
  }

  return result;
}

type Loader = () => Promise<unknown>;

/**
 * Lazy route bundles for @embroider/router.
 *
 * The files of one route load together,
 * then register with the resolver under their classic names.
 */
export function lazyRouteBundles(globbed: Record<string, Loader>) {
  const filesByRoute = new Map<string, Record<string, Loader>>();

  for (const [path, load] of Object.entries(globbed)) {
    const { route } = classicName(path);
    let files = filesByRoute.get(route);

    if (!files) {
      files = {};
      filesByRoute.set(route, files);
    }

    files[path] = load;
  }

  const bundles = [];

  for (const [route, files] of filesByRoute) {
    bundles.push({
      names: [route.replaceAll('/', '.')],
      load: async () => {
        const modules: Record<string, unknown> = {};

        await Promise.all(
          Object.entries(files).map(async ([path, load]) => {
            modules[path] = await load();
          })
        );

        return { default: customLayout(modules) };
      },
    });
  }

  return bundles;
}
