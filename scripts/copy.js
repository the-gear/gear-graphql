/**
 * This file only purpose is to copy files before npm publish and strip churn/security sensitive metadata from package.json
 *
 * **NOTE:**
 * 👉 This file should not use any 3rd party dependency
 */
const { writeFileSync, copyFileSync, mkdirSync, existsSync } = require('fs');
const { resolve } = require('path');
const packageJson = require('../package.json');

const projectRoot = resolve(__dirname, '..');
const distPath = resolve(projectRoot, 'dist');

main();

/**
 * @param {string} src
 * @param {string} [dist]
 */
function copy(src, dist) {
  return copyFileSync(resolve(projectRoot, src), resolve(distPath, dist || src));
}

function main() {
  const distPackageJson = createDistPackageJson(packageJson);

  copy('README.md');
  copy('CHANGELOG.md');
  copy('LICENSE.md');
  copy('.npmignore');
  writeFileSync(resolve(distPath, 'package.json'), distPackageJson);
  if (packageJson.bin) {
    const binPath = resolve(distPath, 'bin');
    if (!existsSync(binPath)) mkdirSync(binPath);
    for (const [name, binPath] of Object.entries(packageJson.bin)) {
      copy(binPath);
    }
  }
}

/**
 * @param {typeof packageJson} packageConfig
 * @return {string}
 */
function createDistPackageJson(packageConfig) {
  const {
    devDependencies,
    scripts,
    engines,
    config,
    husky,
    'lint-staged': lintStaged,
    ...distPackageJson
  } = packageConfig;

  return JSON.stringify(distPackageJson, null, 2);
}
