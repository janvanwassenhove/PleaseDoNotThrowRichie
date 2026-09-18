# Architecture

The browser application uses TypeScript, Vite, Three.js and Rapier. A fixed 60 Hz physics step owns Richie's dynamic rigid body. Rendering follows it through a smoothed third-person camera. Visual and collision geometry are separate.

Positive Z is progression. Registration and exhibition are at y=0, the staircase landing at y=6, and the cinema at y=13. These measurements compress the venue into readable gameplay. Eight proximity checkpoints prevent long repetition.

Richie moves only by physical hops. Space builds charge; release sets an upward and camera-relative directional velocity. Weak air impulses allow corrections. A downward ray detects ground while excluding Richie's collider. When tilted on the floor, recovery assistance returns the body upright after roughly one second.

Voxxy holds Richie without gravity and releases a calculated ballistic velocity. Biggy converts charge into a higher assisted launch. Droid's third recline launches Richie over the auditorium route. Audience zones catch and relay him toward the stage.

Richie is the one non-procedural asset: `src/assets/richie.glb`, built by `scripts/build-richie.py` from the official Reachy Mini description (see `docs/ASSET-SOURCES.md`). It loads through GLTFLoader at 3x life size, hangs 0.44 below the rigid body's origin so the base sits on the collider's underside, and exposes `head`, `antenna_left` and `antenna_right` nodes that the render loop animates. Voxxy, Droid, Biggy and the venue are procedural. No runtime network connection, account or backend is needed.

The build is static and uses relative asset paths, so the same `dist/` runs from a domain root, a GitHub Pages project subpath or a local folder served over HTTP. A boot overlay in `index.html` stays up until the first rendered frame and rewrites itself with a readable message if WebAssembly or WebGL 2 is unavailable, instead of leaving a black page.

`window.__richie` exposes a debug hook over the same state the game loop owns: state and pose readers, starting and skipping the opening, warping to a checkpoint, snapping the chase camera, triggering a hop and forcing the end card. The release screenshots drive that hook rather than synthesising input, which keeps captures deterministic on a software renderer.
