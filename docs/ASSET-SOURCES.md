# Asset sources

## Reachy Mini / Richie

Asset: Richie's render model, `src/assets/richie.glb`. Source: the official Pollen Robotics Reachy Mini robot description (MJCF + STL), as shipped in the `reachy-mini` package on PyPI and in https://github.com/pollen-robotics/reachy_mini (the git checkout keeps the STLs in Git LFS; the wheel carries the real files). Licence: Apache-2.0, see `src/assets/NOTICE-reachy-mini.md`. Modified: `scripts/build-richie.py` walks the MJCF body tree, keeps the visible shell parts (body, head, lenses, antennas), drops the internals (motors, screws, bearing, speaker, camera board, Stewart-platform linkage), derives the facing direction from the camera-lens disc, levels the head about its real pivot, decimates the thin 3D-print shells to a browser budget and writes a Y-up glTF with five named nodes — `base`, `body`, `head`, `antenna_left`, `antenna_right` — whose pivots sit on the real joints, with the MJCF material colours. Usage: player render model at 3x life size (a 28 cm robot at game scale) with an independent primitive collider; the antennas ring on landings and the head nods with vertical speed. Product imagery from https://store.pollen-robotics.com/collections/reachy-mini was used only to check colours and proportions.

## Devoxx robots and venue

Asset: Voxxy, Droid, Biggy and the Kinepolis Antwerp journey. Source: the Robot Games reference page, https://game.devoxx.be/references.html — the three model sheets (`voxxy-robot.png`, `droid-robot.png`, `biggy-robot.png`), the floor plans and the venue photographs. Licence: competition reference material; no reference image is redistributed or stored in this repository. Modified: original procedural models (`src/robots.ts`), with proportions measured off the sheets' front and profile views and materials matched to them —

- **Voxxy** (sheet 01): a wide clear-coated orange head with two bear ears (white-backed), a black glass visor with dot-matrix orange eyes, white headphone discs with a lit ring round a square sensor; a thin dark neck; a pear-shaped body with panel seams, a belly slot and a white cat badge on the chest; small orange shoulder balls, thin black upper arms, big teardrop forearms with a white band, three black knuckled claws per hand; two stick legs on small orange feet. The eyes, badge, seams and the forearm band are drawn to canvas textures and mapped onto lathe profiles resampled by arc length.
- **Droid** (sheet 02): a tall, slightly stooped graphite humanoid. Domed head with two warm lit round eyes and a mouth grille, thin neck with pistons, a breastplate that tapers to an exposed piston waist, pale shoulder collars with segment lines and copper trim, shoulder pads with a white ring emblem (an original one), long arms to the knees with four-fingered hands and a thumb, a V pelvis, drum hip and knee joints, thick thighs, long thin shins with calf plates and piston rods, flat feet.
- **Biggy** (sheet 03): a ball on two stubby legs. The front of the ball is a rusting orange belly with seams and a stencilled badge; the back is blue-grey plate with a hatch, a speaker, an exhaust stub and ports; a riveted, ridged helmet dome with two lens eyes sits on top over a dark slit, with two lugs and a whip antenna; pauldrons with an orange tip over drum shoulders; box forearms with an orange cuff and three dark fingers; orange thigh armour over dark boots.
- **Kinepolis**: the plan is two levels. The ground floor holds the entrance stairs, reception, the BOF rooms and the exhibition hall; the grand staircase, flanked by escalators, leads up to the cinema level with its foyer and the corridor between auditoriums 1–14, where auditorium 8 is the keynote room. The game compresses that route into eight checkpoints and keeps the signage.

An earlier iteration could not reach the reference site and worked from its published descriptions; iteration 10 had the sheets open side by side with the game and rebuilt all three robots against them (Biggy, for one, had been a box on four legs).

## Music

Asset: the in-game music, `src/assets/audio/synaptic-drift.mp3` (3:05). Source: **Synaptic Drift** by **mITy.John** (Jan Van Wassenhove), the author of this game; supplied as a 44.1 kHz 16-bit stereo WAV master, which is not in this repository. Licence: copyright © 2026 Jan Van Wassenhove, all rights reserved. The author grants its use **in this game only** — see `src/assets/audio/NOTICE-synaptic-drift.md`. It is explicitly **not** covered by the repository's MIT licence, and no other use, redistribution or remixing is permitted. Modified: encoded to 128 kbps MP3 with `scripts/import-music.py` (LAME via the `lameenc` package, quality 2); nothing else was changed — no trimming, normalising or looping edits. Usage: loops under the whole game from the first press of anything, at 42% volume, ducked to 12% while the pause card is up, and silenced by `M` or either MUSIC toggle (the choice is remembered in `localStorage`).

## The Devoxx logo

Asset: `src/assets/devoxx-white.svg`, the official Devoxx wordmark (white, with the orange XX and its ™). Source: https://game.devoxx.be/branding/devoxx-white.svg, the vector the Robot Games site itself serves; https://devoxx.be/ carries the same mark only as a 175×53 PNG, too small for a wall. Licence: a trademark of Devoxx, used unmodified to identify the conference this game is an entry for and set in; it is not covered by this repository's MIT licence. Modified: no. At load it is given an intrinsic size (the file has none, and some browsers will not draw a sizeless SVG to a canvas) and drawn onto dark panels — on Devoxx orange the XX would disappear. Usage: the title-screen tag, the sign over the entrance, the reception desk, the hanging banners, the foyer wall and the keynote slide. Every one of those was the word DEVOXX set in Arial before.

## Generated textures

Asset: the image textures under `src/assets/textures/`. Source: generated for this project with ChatGPT image generation (OpenAI), one prompt per image, in a single conversation on 2026-09-18; the prompts are recorded in `prompts/002-textures.md`. Licence: generated for this project by its author; no third-party photograph or texture library is involved. Modified: `scripts/import-texture.py` resizes each download, cross-fades tiling textures against a half-offset copy of themselves so opposite edges match, centre-crops posters to their frame, and cuts Duke out of his white background with a border flood-fill. Usage —

| File | What it is | Where it is used |
| --- | --- | --- |
| `carpet-hall.jpg` | grey needle-felt exhibition carpet | ground-floor floors, booth pads (tinted per brand) |
| `carpet-cinema.jpg` | midnight-navy cinema broadloom with confetti, stars and arcs | foyer, corridor, auditorium tiers |
| `stone-floor.jpg` | honed grey terrazzo | entrance steps, grand staircase, its landing |
| `wall-acoustic.jpg` | dark acoustic cloth panels with shadow gaps | corridor and auditorium walls, the foyer's back wall |
| `seat-velvet.jpg` | crimson cinema velour | seat cushions and backs, the recliner, the stage tabs |
| `metal-rust-orange.jpg` | chipped safety-orange paint over rust | Biggy's belly, cuffs, thigh armour, pauldron tips |
| `metal-bluegrey.jpg` | worn slate-blue armour plate | Biggy's dome, back, pauldrons and forearms |
| `metal-graphite.jpg` | scuffed graphite plating | Droid |
| `booth-1.jpg` … `booth-6.jpg` | booth backdrops for six absurd exhibitors: ROBO-BARISTA 9000, DUKE'S GADGET LAB, RUBBER DUCK AI, TOAST-AS-A-SERVICE, SELF-DRIVING OFFICE CHAIR, NULLPOINTER DETECTOR | the six exhibition booths; four reappear as sponsor lightboxes in the foyer |
| `duke.png` | Duke as a cardboard standee with a lanyard and springy antennas | one by every booth |
| `keynote-bg.jpg` | a text-free keynote backdrop: three robot silhouettes under an orange-to-magenta sky | the screen in auditorium 8, with the Devoxx logo and KEYNOTE set over it at runtime |

Duke is the Java mascot, which Oracle released under the BSD licence (https://openjdk.org/projects/duke/). The generated standee came with a coffee-cup logo on its badge; that logo is a trademark, so the import step paints the badge over as a plain conference badge. Every texture is optional at runtime: a material whose image is missing falls back to a flat colour, and a booth without a poster sets its own name in type.

The gadgets on the booths (a toaster with legs and antennae, a rubber duck with a propeller and one red eye, a paper cup on tank tracks holding a croissant aloft, an office chair with a lidar and boosters, an industrial arm offering a croissant), the popcorn machine, the light fittings, the truss and the seats are original procedural geometry (`src/venue.ts`).

## The crowd

Asset: conference-goers walking the exhibition hall, foyer and corridor, seated in auditorium 8 and standing in its front rows. Source: original procedural figures (`src/people.ts`), seeded for variety — skin and hair, hoodies and T-shirts, jeans, glasses, beards, caps, backpacks, lanyards with badges, coffee cups, laptops, and shirt slogans (JAVA, DEVOXX, `git blame`, …) drawn to canvas textures at runtime. Security guards reuse the same figures with a black uniform, cap, radio, earpiece and a SECURITY shirt. No photographs or third-party models.

No third-party audio, photographs or generated meshes are included. Beyond the Reachy Mini geometry and the generated textures above, materials, signs and venue geometry are made at runtime.
