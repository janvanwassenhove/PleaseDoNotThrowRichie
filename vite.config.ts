import {readFileSync} from 'node:fs';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

const {version} = JSON.parse(readFileSync('./package.json', 'utf8')) as {version: string};

// Relative base so the built site runs from any subpath, including a GitHub Pages
// project site at https://<user>.github.io/<repo>/.
export default defineConfig({
  base: './',
  // Bake the package version in so the title screen shows the real build.
  define: {__APP_VERSION__: JSON.stringify(version)},
  // Rapier's wasm and Three are each a single large chunk by design.
  build: {chunkSizeWarningLimit: 3000},
  plugins: [
    // Installable, offline-capable: the whole game is a static site, so the service
    // worker precaches every build asset (the physics wasm, Richie's GLB and the textures included).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Please Do Not Throw Richie',
        short_name: 'Richie',
        description: 'An irresponsible Devoxx physics game. Richie has a keynote. Richie has no legs.',
        start_url: './',
        scope: './',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#0d1c27',
        theme_color: '#0d1c27',
        icons: [
          {src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png'},
          {src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png'},
          {src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,glb,wasm,png,jpg,svg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
});
