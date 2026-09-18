# PLEASE DO NOT THROW RICHIE

An irresponsible Devoxx physics game.

Richie has a keynote. Richie has no legs. Get him from registration to the keynote stage using hops, Voxxy, Droid, Biggy and the audience.

**▶ Play it:** https://janvanwassenhove.github.io/PleaseDoNotThrowRichie/

The game is a static site: no backend, no account, no physical robot. Every release also ships the same build as a zip on the [releases page](https://github.com/janvanwassenhove/PleaseDoNotThrowRichie/releases), so you can host it yourself.

## Controls

| Action | Key |
| --- | --- |
| Aim | `W` `A` `S` `D` |
| Charge and hop | `SPACE` (hold, then release) |
| Activate a nearby assist | `E` |
| Reset to the last checkpoint | `R` |
| Orbit / zoom the camera | Drag / scroll |

A keyboard is required — there are no touch controls, so a phone or tablet gets the opening cinematic and not much else. WebGL 2 is required; if it is missing or blocked, the page says so instead of going black.

## Run it locally

Node.js 22+ and npm.

```sh
npm ci           # install
npm run dev      # dev server, open the URL Vite prints
npm test         # vitest unit tests
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

`dist/` is a self-contained static site with relative asset paths, so it works from any subpath. Serve it over HTTP — ES modules and the physics WebAssembly will not load over `file://`.

## Screenshots

```sh
npx playwright install chromium   # once
npm run screenshots               # writes screenshots/*.png
```

`scripts/screenshots.mjs` boots a real Vite server and drives the game through the `window.__richie` debug hook in `src/main.ts` rather than synthesising input, so captures are deterministic. On a machine that already has a Chromium build, point `CHROMIUM_PATH` at it instead of installing another one.

## Deployment and releases

Three workflows, all in `.github/workflows/`:

- **`ci.yml`** — tests and builds every push and pull request.
- **`deploy.yml`** — publishes `dist/` to GitHub Pages on every push to `main`, and again when a release is published so the live version badge matches the newest release. Enable it once under *Settings → Pages → Build and deployment → Source: GitHub Actions*.
- **`release.yml`** — every push to `main` cuts a patch release: it runs the tests, bumps `package.json`, tags it, captures the screenshots, zips the built site and publishes a GitHub Release with the screenshots, the zip and a changelog generated from the commits. Use the workflow's *Run workflow* button for a minor or major bump, or put `[skip release]` in a commit message to skip one.
- **`tidy-artifacts.yml`** — weekly cleanup of leftover Actions artifacts.

## Documentation

[Game brief](docs/GAME-BRIEF.md) · [architecture](docs/ARCHITECTURE.md) · [asset sources](docs/ASSET-SOURCES.md) · [AI log](docs/AI-DEVELOPMENT-LOG.md)
