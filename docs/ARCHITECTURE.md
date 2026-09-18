# Architecture

The browser application uses TypeScript, Vite, Three.js and Rapier. A fixed 60 Hz physics step owns Richie's dynamic rigid body. Rendering follows it through a smoothed third-person camera. Visual and collision geometry are separate.

Positive Z is progression. Registration and exhibition are at y=0, the staircase landing at y=6, and the cinema at y=13. These measurements compress the venue into readable gameplay. Eight proximity checkpoints prevent long repetition.

Richie moves only by physical hops. Space builds charge; release sets an upward and camera-relative directional velocity. Weak air impulses allow corrections. A downward ray detects ground while excluding Richie's collider. When tilted on the floor, recovery assistance returns the body upright after roughly one second.

Voxxy holds Richie without gravity and releases a calculated ballistic velocity. Biggy converts charge into a higher assisted launch. Droid's third recline launches Richie over the auditorium route. Audience zones catch and relay him toward the stage.

All visual content is procedural. No runtime network connection, account or backend is needed.
