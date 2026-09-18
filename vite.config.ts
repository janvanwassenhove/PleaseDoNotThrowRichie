import {readFileSync} from 'node:fs';
import {defineConfig} from 'vite';

const {version} = JSON.parse(readFileSync('./package.json', 'utf8')) as {version: string};

// Relative base so the built site runs from any subpath, including a GitHub Pages
// project site at https://<user>.github.io/<repo>/.
export default defineConfig({
  base: './',
  // Bake the package version in so the title screen shows the real build.
  define: {__APP_VERSION__: JSON.stringify(version)},
  // Rapier's wasm and Three are each a single large chunk by design.
  build: {chunkSizeWarningLimit: 3000},
});
