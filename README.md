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
| Skip the opening | `SPACE`, `ENTER`, `E` or a tap |

**Mind security.** Four guards patrol the exhibition hall, the foyer and the corridor; the yellow cone on the floor is what they see. Get spotted and it turns red and they give chase — caught, and you are hoisted overhead and thrown back to the previous checkpoint. Hop over their heads, break line of sight behind a booth, or let Voxxy and Biggy carry you past.

On a phone or tablet the controls are on screen: a stick to aim, **HOP** (hold to charge, let go to jump), **E** and **R**. Landscape works best. The game is a PWA — *Add to Home Screen* installs it, and after one visit it runs offline. WebGL 2 is required; if it is missing or blocked, the page says so instead of going black.

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

## Richie's model

Richie is the official [Reachy Mini](https://github.com/pollen-robotics/reachy_mini) geometry (Apache-2.0, see `src/assets/NOTICE-reachy-mini.md`), converted to `src/assets/richie.glb`. To regenerate it:

```sh
pip install numpy scipy trimesh fast-simplification
pip download reachy-mini --no-deps -d /tmp/rm && (cd /tmp/rm && unzip -q *.whl)
python3 scripts/build-richie.py /tmp/rm/reachy_mini/descriptions/reachy_mini/mjcf src/assets/richie.glb
```

The wheel, not the git checkout: the repository keeps its STLs in Git LFS. Voxxy, Droid, Biggy (`src/robots.ts`), the conference crowd (`src/people.ts`) and the venue are procedural, built to the [Robot Games references](https://game.devoxx.be/references.html) — see [asset sources](docs/ASSET-SOURCES.md). `npm run icons` re-renders the PWA icons from `public/favicon.svg`.

## Deployment and releases

Three workflows, all in `.github/workflows/`:

- **`ci.yml`** — tests and builds every push and pull request.
- **`deploy.yml`** — publishes `dist/` to GitHub Pages on every push to `main`, and again when a release is published so the live version badge matches the newest release. Enable it once under *Settings → Pages → Build and deployment → Source: GitHub Actions*.
- **`release.yml`** — every push to `main` cuts a patch release: it runs the tests, captures the screenshots and zips the built site (both from a checkout bumped to the version it is becoming), and only then bumps `package.json` for real, tags it and publishes a GitHub Release with the screenshots, the zip and a changelog generated from the commits since the last published release. Nothing is tagged unless everything before it succeeded. Use the workflow's *Run workflow* button for a minor or major bump, or put `[skip release]` in a commit message to skip one.
- **`tidy-artifacts.yml`** — weekly cleanup of leftover Actions artifacts.

## Documentation

[Game brief](docs/GAME-BRIEF.md) · [architecture](docs/ARCHITECTURE.md) · [asset sources](docs/ASSET-SOURCES.md) · [AI log](docs/AI-DEVELOPMENT-LOG.md)
