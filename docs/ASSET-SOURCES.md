# Asset sources

## Reachy Mini / Richie

Asset: Richie's render model, `src/assets/richie.glb`. Source: the official Pollen Robotics Reachy Mini robot description (MJCF + STL), as shipped in the `reachy-mini` package on PyPI and in https://github.com/pollen-robotics/reachy_mini (the git checkout keeps the STLs in Git LFS; the wheel carries the real files). Licence: Apache-2.0, see `src/assets/NOTICE-reachy-mini.md`. Modified: `scripts/build-richie.py` walks the MJCF body tree, keeps the visible shell parts (body, head, lenses, antennas), drops the internals (motors, screws, bearing, speaker, camera board, Stewart-platform linkage), derives the facing direction from the camera-lens disc, levels the head about its real pivot, decimates the thin 3D-print shells to a browser budget and writes a Y-up glTF with five named nodes — `base`, `body`, `head`, `antenna_left`, `antenna_right` — whose pivots sit on the real joints, with the MJCF material colours. Usage: player render model at 3x life size (a 28 cm robot at game scale) with an independent primitive collider; the antennas ring on landings and the head nods with vertical speed. Product imagery from https://store.pollen-robotics.com/collections/reachy-mini was used only to check colours and proportions.

## Devoxx robots and venue

Asset: Voxxy, Droid, Biggy and the Kinepolis Antwerp journey. Source: the Robot Games reference page, https://game.devoxx.be/references.html, and the competition pages at https://game.devoxx.be/. Licence: competition reference material; no images are redistributed and no reference file is stored in this repository. Modified: original low-poly interpretations built to the published descriptions —

- **Voxxy**: "the orange companion — light, curious and quick on its feet". Orange, rounded and compact, with a dark visor and two lit eyes, a small antenna, stub arms and two short legs with wide feet.
- **Droid**: "tall, weathered and deliberate, with exposed joints and scuffed panels — it has been in the building a long time". Tall and thin in graphite, with visible ball joints and pistons at hips, knees, shoulders and elbows, scuffed rust-brown panels, cable runs and a single wide sensor bar.
- **Biggy**: "short legs, heavy armour, no hurry — slow to start and hard to stop once it is moving". Wide, low and blue-grey with layered riveted plates, orange bumpers, a sunken head with a narrow orange visor and four very short legs on flat feet.
- **Kinepolis**: the plan is two levels. The ground floor holds the entrance stairs, reception, the BOF rooms and the exhibition hall; the grand staircase, flanked by escalators, leads up to the cinema level with its foyer and the corridor between auditoriums 1–14, where auditorium 8 is the keynote room. The game compresses that route into eight checkpoints and keeps the signage.

The model sheets themselves could not be fetched from the environment that produced these models (the reference site is not reachable from it), so the robots are validated against the site's published descriptions and the earlier iteration's notes on the sheets' dominant colours, not against the sheet drawings pixel for pixel.

## The crowd

Asset: conference-goers walking the exhibition hall, foyer and corridor, seated in auditorium 8 and standing in its front rows. Source: original procedural figures (`src/people.ts`), seeded for variety — skin and hair, hoodies and T-shirts, jeans, glasses, beards, caps, backpacks, lanyards with badges, coffee cups, laptops, and shirt slogans (JAVA, DEVOXX, `git blame`, …) drawn to canvas textures at runtime. No photographs or third-party models.

No third-party audio, textures or generated meshes are included beyond the Reachy Mini geometry above. Materials, signs and venue geometry are made at runtime.
