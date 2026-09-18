# 002 — Generated textures

Tool: ChatGPT image generation, one conversation, 2026-09-18. Each prompt produced one image, which
`scripts/import-texture.py` brought into `src/assets/textures/` under the name given. The human
instruction behind all of it:

> I want hyper realism. For the robots, use the reference cards
> (https://game.devoxx.be/references.html). For Kinepolis, use ChatGPT to generate textures — carpet,
> booths (make the booths absurd robot gadgets, Java Duke mascots, …).

## Tiling surfaces (`--tile`)

Shared preamble, stated in the first prompt and referred to as "same rules" afterwards:

> A seamless, tileable, photorealistic PBR albedo texture, shot perfectly top-down (or flat head-on)
> with flat even lighting and no shadows or vignette. No objects, no seams, no borders, no text.
> Square 1:1, edges must tile seamlessly.

- **carpet-hall** — commercial exhibition-hall carpet. Medium-dark grey needle-felt carpet with subtle
  blue-grey heathered flecks and very fine fibre detail, like the floor of a convention centre.
- **carpet-cinema** — multiplex cinema carpet. Deep midnight-navy woven broadloom with a repeating
  pattern of small scattered confetti dashes, stars and arcs in warm orange, red and gold, slightly
  worn pile, visible yarn texture. The pattern must be small (about 12 repeats across) so it tiles
  without obvious repetition.
- **metal-rust-orange** — weathered orange painted steel for an old industrial robot. Matte
  safety-orange paint, heavily worn: large irregular patches where the paint has chipped and faded to
  dark brown-grey rust and bare dull steel, fine scratches, grime streaks, oxidation blooms, subtle
  dents. About 65% orange paint, 35% rust and dark wear, distributed evenly.
- **metal-bluegrey** — weathered blue-grey painted armour plate for the same robot. Matte slate
  blue-grey paint, worn: scattered chips down to dark bare steel, fine hairline scratches in many
  directions, a few small rust-brown oxidation spots and grime streaks, subtle dents. About 85% paint,
  15% wear.
- **metal-graphite** — dark graphite plating for a tall, old security droid. Near-black charcoal grey
  with a slight cool blue tint, satin painted metal; worn edges and lots of fine pale hairline
  scratches and scuffs, small chips to lighter bare metal, faint dust and a few tiny copper-brown
  oxidation specks. About 90% uniform graphite.
- **seat-velvet** (`--size 512`) — deep red cinema seat velvet. Rich crimson/burgundy short-pile velour
  with fine woven texture, subtle nap direction variation and slight wear sheen. Uniform, no seams,
  no buttons, no folds.
- **wall-acoustic** — dark cinema auditorium acoustic wall covering. Deep charcoal-navy woven acoustic
  fabric stretched over panels, with slim vertical shadow-gap joints every quarter of the width,
  subtle weave visible, very dark and matte.
- **stone-floor** — honed light-grey natural stone / fine terrazzo as used on a grand public staircase.
  Fine speckled aggregate in greys and off-white, very subtle veining, no grout lines, no tile joints.

## Booth backdrops (`--size 1280 --crop 3x2`)

Shared preamble:

> A trade-show booth backdrop poster, landscape 3:2, glossy photorealistic product-advert style, for
> an absurd fictional robot-gadget company exhibiting at a Java developer conference. The artwork is a
> flat graphic that fills the whole frame edge to edge: no mock-up, no booth, no room, no people, no
> borders.

- **booth-1** — headline exactly "ROBO-BARISTA 9000", tagline exactly "NOW WITH 40% FEWER BURNS". An
  over-engineered chrome espresso-machine robot with six tiny arms, googly camera eyes and a
  steam-whistle hat, handing a paper coffee cup to Duke, the Java mascot. Warm orange and dark navy.
- **booth-2** — "DUKE'S GADGET LAB" / "WRITE ONCE, GADGET ANYWHERE". Duke in lab goggles among
  ridiculous gadgets on a workbench: a jetpack toaster, a rubber duck with a propeller, a robot-hand
  stapler, a coffee mug on tank tracks. Red, white and electric blue.
- **booth-3** — "RUBBER DUCK AI" / "IT LISTENS. IT JUDGES.". A giant glossy yellow rubber duck with one
  glowing red robot eye, an antenna and a tiny headset, on top of a humming server rack. Yellow and
  deep teal.
- **booth-4** — "TOAST-AS-A-SERVICE" / "99.9% UPTIME. 100% CRUMBS.". A retro chrome toaster robot with
  little legs, antenna ears and an LED smile launching toast into a fluffy cloud. Green and cream.
- **booth-5** — "SELF-DRIVING OFFICE CHAIR" / "STAND-UPS WILL NEVER BE THE SAME". An ergonomic office
  chair with a spinning lidar dome, headlights, tiny rocket boosters and warning stickers, drifting
  round a corner, carrying Duke. Purple and neon orange.
- **booth-6** — "NULLPOINTER DETECTOR" / "BEEPS BEFORE PRODUCTION DOES". A chunky handheld
  yellow-and-black gadget with a satellite dish, a needle gauge in the red, blinking lights and a
  robot claw, scanning a glowing laptop. Hazard yellow and black.

## One-offs

- **duke** (`--alpha`) — Duke, the Java mascot (black-and-white teardrop-shaped character, big round red
  nose, two small white hands), as a life-size printed cardboard standee cut-out, full body, centred,
  waving, wearing an orange conference lanyard with a badge and a headband with two springy robot
  antennas. Pure white background, no shadow, no floor, no text. Portrait 2:3. *Post-processing: the
  generated badge carried a coffee-cup logo, which is a trademark; it was painted over as a plain
  conference badge.*
- **keynote-screen** (`--size 1600 --crop 16x9`) — a cinematic conference keynote title slide, 16:9, flat
  image, no screen frame, no room, no audience. Huge bold white text exactly "DEVOXX" and below it
  smaller text exactly "KEYNOTE". Dramatic glowing orange to deep magenta gradient with light rays and
  film grain, and the dark heroic silhouettes of three robots: one small round robot with bear ears,
  one tall thin humanoid droid, one huge ball-shaped heavy robot.

## What did not work first time

- "Seamless" is a request, not a guarantee: every tiling texture showed an edge. The import step's
  cross-fade fixed all of them without a second generation.
- The blue-grey plate rendered grey in the game until its material stopped being metallic enough to
  mirror a grey room.
- The graphite came back close to black; a colour multiplier above one in the material lifts it to the
  sheet's tone without regenerating.
