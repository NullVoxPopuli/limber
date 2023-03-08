import latestVersion from 'latest-version';
import { packageJson } from 'ember-apply';

const EMBROIDER_PACKAGES = [
  "@embroider/addon-dev",
  "@embroider/addon-shim",
  "@embroider/core",
  "@embroider/compat", 
  "@embroider/macros",
  "@embroider/hbs-loader",
  "@embroider/router",
  "@embroider/shared-internals",
  "@embroider/test-setup",
  "@embroider/util",
  "@embroider/webpack", 
]

export async function useUnstableEmbroider() {
  let withVersions = await Promise.all(EMBROIDER_PACKAGES.map(async name => {
    let version = await latestVersion(name, { version: 'unstable' });

    return [name, version];
  }));

  await packageJson.modify(( json ) => {
    for (let [name, version] of withVersions) {
      json.pnpm.overrides[name] = version;
    }
  });
}

