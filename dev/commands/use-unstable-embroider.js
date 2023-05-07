import { packageJson, project } from 'ember-apply';
import latestVersion from 'latest-version';

const EMBROIDER_PACKAGES = [
  '@embroider/addon-dev',
  '@embroider/addon-shim',
  '@embroider/core',
  '@embroider/compat',
  '@embroider/macros',
  '@embroider/hbs-loader',
  '@embroider/router',
  '@embroider/shared-internals',
  '@embroider/test-setup',
  '@embroider/util',
  '@embroider/webpack',
];

const DEP_TYPES = ['dependencies', 'devDependencies', 'peerDependencies'];

export async function useUnstableEmbroider() {
  let withVersions = await Promise.all(
    EMBROIDER_PACKAGES.map(async (name) => {
      let version = await latestVersion(name, { version: 'unstable' });

      return [name, version];
    })
  );

  // Update in-monorepo things (at the very least for busting turbo's cache)
  // eslint-disable-next-line no-unused-vars
  for await (let workspace of await project.eachWorkspace()) {
    await packageJson.modify((json) => {
      for (let depType of DEP_TYPES) {
        for (let [name, version] of withVersions) {
          if (json[depType]?.[name]) {
            json[depType][name] = version;
          }
        }
      }
    });
  }

  // Handle transient dependencies
  await packageJson.modify((json) => {
    for (let [name, version] of withVersions) {
      json.pnpm.overrides[name] = version;
    }
  });
}
