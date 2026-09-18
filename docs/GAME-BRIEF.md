# PLEASE DO NOT THROW RICHIE

### An irresponsible Devoxx physics game

**Repository:**
https://github.com/janvanwassenhove/PleaseDoNotThrowRichie

**Repository name:** `PleaseDoNotThrowRichie`

**Default branch:** `main`

**Game title:**

# PLEASE DO NOT THROW RICHIE

**Tagline:**

> Richie has a keynote.
> Richie has no legs.
> Please do not throw Richie.

Spoiler: **you will throw Richie. A lot.**

---

# 1. Elevator pitch

Build a short, absurd, physics-driven 3D game set at **Devoxx Belgium inside Kinepolis Antwerp**.

Richie Mini is late for his keynote.

Unfortunately:

**Richie has no legs.**

He also has:

- no wheels
- questionable mobility
- two expressive antennas
- an unfortunate relationship with gravity

His primary movement mechanism is:

# HOP

During the game Richie will:

- hop
- bounce
- tumble
- roll
- fall down stairs
- get blown around
- get catapulted
- get thrown by Voxxy
- get launched by Droid-controlled machinery
- get hit extremely hard by Biggy

The player's objective:

> **Get Richie from Devoxx registration to the keynote stage.**

Target first-play completion time:

**8–12 minutes.**

---

# 2. Game inspiration

The game should feel like a deliberately simple combination of:

- Crossy Road
- mini golf
- Human Fall Flat
- Getting Over It
- silly rigid-body physics

Do not attempt to reproduce the complexity of those games.

The concept should be understandable within five seconds:

> That little robot has no legs and somehow needs to cross Devoxx.

---

# 3. Core design principle

The game is built around one question:

# HOW DO WE GET RICHIE OVER THERE?

Sometimes the answer is:

**hop.**

Later:

**throw him.**

Later:

**launch him.**

Eventually:

**hit him with Biggy.**

The title says:

# PLEASE DO NOT THROW RICHIE

The game progressively teaches the player that throwing Richie is exactly what they need to do.

---

# 4. Competition priority

This is an entry for the Devoxx Robot Games.

Canonical competition/reference site:

[https://game.devoxx.be/references.html](https://game.devoxx.be/references.html)

The game must meaningfully include:

- Voxxy
- Droid
- Biggy
- recognisable Kinepolis / Devoxx locations
- convincing differences in robot physics
- a runnable public GitHub repository
- GenAI development documentation

Prioritise:

**original mechanic > fun > physics > environment recognisability > graphical complexity**

Do not build a generic robot platformer.

---

# 5. Canonical visual references

Visual references are **requirements**, not vague inspiration.

Astra must not redesign the robots into unrelated characters.

All four robots should be recognisable immediately.

---

# 6. Richie Mini — canonical source

Richie is based on the real **Pollen Robotics Reachy Mini**.

Do NOT reconstruct Richie purely from AI-generated images unless required.

Use official Reachy Mini geometry as the preferred basis for the in-game model.

## Official source repository

https://github.com/pollen-robotics/reachy_mini

The official Reachy Mini project contains the robot description and simulation assets used to represent Reachy Mini in MuJoCo.

Use these assets as the starting point for:

- correct proportions
- head geometry
- body/base
- antenna placement
- joint structure
- silhouette

Where appropriate:

1. locate the official simulation/mesh geometry
2. inspect the robot hierarchy
3. extract/reuse appropriate geometry according to its licence
4. convert required geometry into a game-friendly GLB/GLTF
5. simplify geometry where required
6. optimise materials and draw calls
7. preserve the unmistakable Reachy Mini appearance

Do not unnecessarily remodel something for which official geometry already exists.

---

# 7. Richie visual appearance references

Use official Pollen Robotics product imagery to validate:

- colours
- materials
- camera/head appearance
- body finish
- antennas
- physical proportions

Official Reachy Mini product source:

[https://store.pollen-robotics.com/collections/reachy-mini](https://store.pollen-robotics.com/collections/reachy-mini)

Store selected official visual references under:

```text
references/
└── richie/
    ├── README.md
    ├── product-images/
    ├── simulation-source.md
    └── LICENSE-NOTES.md

```

`simulation-source.md` should identify which upstream files/models were used.

`LICENSE-NOTES.md` should document the licence/source of any reused assets.

Do not blindly copy web images into the final game if they are only needed as modelling references.

---

# 8. Richie modelling constraints

Richie must retain his real-world fundamental design.

He has:

- expressive head
- two antennas
- desktop-scale body/base
- no legs
- no arms
- no wheels

Absolutely do not:

- add legs
- add wheels
- turn him humanoid
- give him conventional walking animation

His inconvenient physical design **is the game mechanic**.

The game version may simplify geometry and exaggerate physical reactions.

That is encouraged.

---

# 9. Devoxx robot references

Use the official Devoxx references:

[https://game.devoxx.be/references.html](https://game.devoxx.be/references.html)

The provided character/model sheets for:

### Voxxy

Orange, rounded, compact and agile.

Role:

**precision throw**

### Droid

Tall, thin, mechanical and technical.

Role:

**environment control**

### Biggy

Heavy, compact and massive.

Role:

**violent momentum**

Download/store relevant official reference material under:

```text
references/
└── devoxx/
    ├── voxxy/
    ├── droid/
    ├── biggy/
    └── README.md

```

The game models may be optimised/stylised, but they must retain:

- silhouette
- proportions
- dominant colours
- key visual characteristics

---

# 10. Kinepolis Antwerp references

Kinepolis is not a generic convention centre.

The venue itself is an important character.

Canonical source:

[https://game.devoxx.be/references.html](https://game.devoxx.be/references.html)

Use the supplied:

- floor plans
- annotated maps
- photographs
- auditorium references
- exhibition references
- foyer imagery
- drone footage

Reproduce the recognisable spatial journey rather than modelling every centimetre.

Important locations:

1. entrance / registration
2. exhibition floor
3. stairs / escalators
4. cinema foyer
5. auditorium corridor
6. auditorium
7. keynote stage

Store local development references under:

```text
references/
└── devoxx/
    └── kinepolis/
        ├── maps/
        ├── photos/
        ├── drone-reference/
        └── README.md

```

---

# 11. Art direction

Target:

# Stylised cinematic realism

Not photorealistic.

The robots should receive more detail than background props.

Environment goals:

- recognisable architecture
- strong Devoxx identity
- cinema lighting
- clear gameplay readability
- exaggerated physics props
- excellent browser performance

Potential comedy props:

- giant coffee cups
- suspiciously springy cinema chairs
- beanbags
- catering trolleys
- conference banners
- backpacks
- cables
- giant swag
- booth fans

---

# 12. Opening cinematic

The game starts with a short **15–20 second in-engine cinematic**.

No long exposition.

No scrolling story text.

The cinematic must establish:

**where Richie is**

versus

**where Richie needs to get.**

---

## Shot 1 — Establish Kinepolis

Wide cinematic shot.

Show Kinepolis / Devoxx.

Camera enters the building.

Approximately 2 seconds.

---

## Shot 2 — Exhibition floor

Quick cinematic fly-through.

Show:

- Devoxx booths
- banners
- developers
- robots
- activity
- coffee

Approximately 3 seconds.

---

## Shot 3 — Journey upward

Camera heads toward the stairs/escalators.

Rise into the cinema level.

The player should subconsciously understand:

**the destination is upstairs.**

Approximately 3 seconds.

---

## Shot 4 — Keynote room

Enter the main auditorium.

Show scale.

Rows of cinema seats.

Push toward the illuminated keynote stage.

Music becomes absurdly heroic.

Display:

# KEYNOTE STARTS IN 10:00

Approximately 3 seconds.

---

## Shot 5 — Richie

Hard cut.

Silence.

Richie is sitting alone near registration.

Very far away.

Camera slowly moves toward Richie.

Richie looks toward camera.

Display:

# ONE SMALL PROBLEM.

Pause.

Camera tilts down.

No legs.

Display:

# RICHIE HAS NO LEGS.

Pause.

Richie makes one tiny pathetic hop.

**boing**

Then:

# PLEASE DO NOT THROW RICHIE

Subtitle:

### An irresponsible Devoxx physics game

Control passes directly to the player.

---

# 13. Controls

Keep controls extremely simple.

## Keyboard

**WASD**

Aim / influence Richie.

**SPACE — tap**

Small hop.

**SPACE — hold**

Charge hop.

Release:

jump.

**Mouse**

Rotate camera.

**R**

Reset to checkpoint.

## Controller

Left stick:

direction.

Main face button:

hop / charge.

Right stick:

camera.

---

# 14. Richie physics

Richie must not behave like a normal character controller.

He should feel like a physical object that the player is barely controlling.

State flow:

```text
IDLE
 ↓
CHARGING
 ↓
HOP
 ↓
AIRBORNE
 ↓
LAND
 ├── stable → IDLE
 │
 └── unstable
       ↓
     TUMBLE
       ↓
     RECOVER
       ↓
      IDLE

```

Possible collision reactions:

- tip sideways
- bounce
- spin
- roll
- slide
- faceplant
- ricochet

After roughly 1–1.5 seconds, recovery assistance should return Richie upright.

Rule:

# Awkward but fair.

Never leave the player trapped in realistic physics.

---

# 15. Voxxy mechanic

## THROW RICHIE

Voxxy is agile and precise.

At appropriate obstacles, the player temporarily controls Voxxy.

Voxxy picks Richie up.

Player determines:

- direction
- angle
- power

Release.

Richie flies.

Use for:

- crossing gaps
- balconies
- barriers
- shortcuts
- reaching higher platforms

Voxxy represents:

# PRECISION LAUNCH

The first Voxxy throw should be almost impossible to fail.

Later throws may become riskier.

---

# 16. Droid mechanic

## ACTIVATE QUESTIONABLE MACHINERY

Droid operates the environment.

No complicated hacking minigames.

Droid controls:

- elevators
- doors
- escalators
- fans
- moving platforms
- conveyors
- cinema seats
- barriers
- stage equipment

Many machines accidentally become Richie-launching devices.

Example:

Richie sits on cinema chair.

Droid:

**RECLINE**

Nothing.

Again.

**RECLINE**

Nothing.

Third attempt:

# EJECT MODE

Richie:

**FWWWWOOOOOSH**

Droid represents:

# ENVIRONMENTAL LAUNCH

---

# 17. Biggy mechanic

## HIT RICHIE VERY HARD

Biggy needs to feel MASSIVE.

Biggy:

- accelerates slowly
- weighs a lot
- carries momentum
- is difficult to stop
- produces violent collisions

Gameplay:

1. position Richie
2. position Biggy
3. aim
4. hold acceleration
5. build momentum
6. release

Then:

# WHAM

Richie:

# FWWWWOOOOOOOSH

Biggy represents:

# MAXIMUM CHAOS

This should be one of the game's signature moments.

---

# 18. Character presentation

All four robots should feel like one ridiculous expedition through Devoxx.

Where technically feasible:

- Richie is the main controlled character
- Voxxy, Droid and Biggy travel through the environment
- helper robots appear naturally at appropriate sections
- they should not feel like disconnected minigame vending machines

Visually:

Voxxy moves easily.

Droid walks/mechanically navigates.

Biggy moves slowly and heavily.

Richie:

**boing**

**boing**

**boing**

---

# 19. Gameplay structure

Use one mostly continuous journey.

Do not create dozens of separate levels.

Target:

**7–8 strong situations.**

---

# 20. Area 1 — Registration

Teach hopping naturally.

Props:

- queue barriers
- signs
- luggage
- backpacks
- small stairs
- attendees

No tutorial dialog.

First instruction:

# SPACE TO HOP

That's enough.

---

# 21. Area 2 — Exhibition floor

Introduce richer physics.

Potential obstacles:

- booth furniture
- cables
- beanbags
- coffee tables
- banners
- developers
- catering carts
- rolling objects
- fans

Contextual jokes:

Coffee collision:

# ESPRESSO YOURSELF

Booth collision:

# SPONSORED CONTENT

Hard wall collision:

# BONK

---

# 22. Area 3 — Voxxy introduction

Create an impossible gap.

Richie cannot hop across.

Voxxy arrives.

Prompt:

# VOXXY CAN HELP

Voxxy picks Richie up.

Then:

# HOLD TO THROW

Player immediately understands the game's title is a lie.

---

# 23. Area 4 — Stairs / escalators

Richie must go upward.

Unfortunately:

Richie cannot walk.

Hop upward.

Mistime landing.

Richie falls.

**bonk**

**bonk**

**bonk**

**bonk**

**bonk**

Checkpoint at top/bottom should prevent frustration.

---

# 24. Area 5 — Biggy introduction

Create a height Richie cannot reach.

Biggy appears.

Player positions him.

Charge.

Impact.

Possible contextual messages:

Low velocity:

# GENTLE NUDGE

Medium:

# QUESTIONABLE DECISION

High:

# THIS SEEMS UNSAFE

Extreme:

# ORBIT ACHIEVED

Correct launch lands Richie upstairs.

---

# 25. Area 6 — Cinema corridor

Short Frogger/Crossy-Road-style section.

Hazards:

- developers
- opening auditorium doors
- catering carts
- cleaning trolley
- robots
- equipment cases

Hop between safe zones.

Keep this section quick.

---

# 26. Area 7 — Auditorium

Turn cinema seating into a physics playground.

Richie hops across:

- seats
- armrests
- rows
- aisles

Droid manipulates:

- folding chairs
- recliners
- stage equipment

Some chairs can launch Richie unexpectedly.

---

# 27. Finale — crowd surfing

The keynote stage is finally visible.

There is no normal path.

Richie jumps into the audience.

The audience becomes the transport mechanism.

Groups of attendees:

catch Richie

↓

throw Richie

↓

next group catches him

↓

throw again

Player gets limited mid-air steering.

Final throw enters cinematic slow motion.

Richie flies toward stage.

Heroic music.

He does **not** land elegantly.

# WHAM

Silence.

Richie slowly rights himself.
Antennas rise.

Stage lights turn on.

# KEYNOTE READY

---

# 28. Results

Display both real and absurd statistics.

Example:

```text
KEYNOTE READY

TIME                       08:47
HOPS                         184
FACEPLANTS                    31
VOXXY THROWS                   6
BIGGY IMPACTS                  8
UNINTENDED STAIR DESCENTS     47
COFFEES DESTROYED              13
CROISSANTS DESTROYED           26
DEVELOPERS INJURED              0*

* probably

```

---

# 29. Humour language

Prefer very short contextual messages.

Potential vocabulary:

```text
BONK

NOT LIKE THAT

PLEASE STOP

GRAVITY ENABLED

RICHIE DISAGREES

PHYSICS!

GOOD ENOUGH

THIS SEEMS UNSAFE

ORBIT ACHIEVED

ARCHITECTURAL DECISION

WORKS ON MY MACHINE

UNHANDLED EXCEPTION

SEGMENTATION FAULT

RETRY-DRIVEN DEVELOPMENT

EXPECTED BEHAVIOUR

FEATURE, NOT BUG

```

Do not turn the game into a sequence of programmer jokes.

Physics remains the primary comedy.

---

# 30. Failure model

No:

- lives
- HP
- death animation
- game-over screen

Failure should itself be entertaining.

If Richie exits the playable world:

quick fade

↓

latest checkpoint

Never force the player to repeat more than roughly **30 seconds**.

---

# 31. Optional collectibles

Use Devoxx/Duke-related collectibles.

Collectibles should encourage:

- risky jumps
- shortcuts
- funny launches

Never make them mandatory.

Potential completion reward:

# GOLDEN RICHIE

Purely cosmetic.

Extremely unnecessary.

Therefore essential.

---

# 32. Physical Richie mode

The game must work completely without the real Reachy Mini.

But add optional physical integration later.

When detected:

```text
PHYSICAL RICHIE
CONNECTED

```

Possible reactions:

Game Richie hops:

→ real Richie performs subtle bounce/head motion.

Game Richie faceplants:

→ real Richie shakes his head.

Biggy collision:

→ real Richie performs dramatic reaction.

Game Richie falls down stairs:

→ real Richie slowly turns toward the player.

Victory:

→ antennas celebrate.

Important:

The physical robot must never be required to complete the game.

---

# 33. Technical stack

Preferred starting stack:

- TypeScript
- Vite
- Three.js
- Rapier
- WebGL
- GLB/GLTF assets

Prefer client-side architecture.

Avoid backend services unless clearly necessary.

Target:

**modern desktop browser at \~60 FPS.**

---

# 34. Repository

Use the EXISTING repository:

https://github.com/janvanwassenhove/PleaseDoNotThrowRichie

Do not create another repository.

Do not rename the repository.

Work on:

```text
main

```

unless a development branch strategy is explicitly introduced later.

Initial structure:

```text
PleaseDoNotThrowRichie/

├── README.md
├── LICENSE
├── package.json
├── vite.config.ts
│
├── docs/
│   ├── GAME-BRIEF.md
│   ├── ARCHITECTURE.md
│   ├── ASSET-SOURCES.md
│   └── AI-DEVELOPMENT-LOG.md
│
├── prompts/
│   ├── 001-project-bootstrap.md
│   ├── 002-richie-locomotion.md
│   ├── 003-voxxy-interaction.md
│   ├── 004-droid-machinery.md
│   ├── 005-biggy-physics.md
│   └── README.md
│
├── references/
│   ├── README.md
│   │
│   ├── richie/
│   │   ├── README.md
│   │   ├── product-images/
│   │   ├── simulation-source.md
│   │   └── LICENSE-NOTES.md
│   │
│   └── devoxx/
│       ├── README.md
│       ├── voxxy/
│       ├── droid/
│       ├── biggy/
│       └── kinepolis/
│
├── public/
│   ├── models/
│   ├── textures/
│   ├── audio/
│   └── images/
│
└── src/
    ├── main.ts
    ├── game/
    ├── characters/
    ├── physics/
    ├── camera/
    ├── world/
    ├── interactions/
    ├── cinematic/
    ├── reachy/
    ├── audio/
    └── ui/

```

---

# 35. Asset source documentation

Create:

```text
docs/ASSET-SOURCES.md

```

Every external source should record:

```text
Asset:
Source:
Original URL/repository:
Licence:
Modified:
Usage:

```

Especially document:

- Reachy Mini meshes
- Reachy Mini visual references
- Devoxx robot references
- Kinepolis reference assets
- audio
- textures
- generated 3D models

Do not lose source provenance during AI-assisted asset creation.

---

# 36. GenAI development log

Maintain:

```text
docs/AI-DEVELOPMENT-LOG.md

```

Record every meaningful AI iteration.

Template:

```markdown
## Iteration

Date:

Goal:

AI/tool:
GPT-6 Astra

Prompt:
prompts/...

Generated:
- ...

Observed problems:
- ...

Human decisions:
- ...

Changes:
- ...

Result:
- ...

Next:
- ...

```

Keep failed/poor generations where they reveal useful iteration.

Do not pretend the first AI generation worked perfectly.

---

# 37. Critical development rule

# DO NOT BUILD KINEPOLIS FIRST.

Do not initially build:

- cinematic
- crowds
- final characters
- auditorium
- detailed environment
- physical Reachy integration

First prove one thing:

# IS RICHIE FUN TO MOVE?

---

# 38. Sprint 1 — Richie Physics Playground

Build a grey-box playground.

Environment:

- flat floor
- small stairs
- large staircase
- ramps
- walls
- blocks
- gaps
- raised platform
- large drop

Use official Reachy Mini geometry if it can be imported quickly.

If conversion delays prototyping:

use a temporary proxy collider/model with approximately correct proportions.

Do NOT spend the sprint polishing the model.

Implement:

- rigid body
- collisions
- directional aiming
- small hop
- charged hop
- airborne influence
- bounce
- tumble
- automatic recovery
- checkpoint
- out-of-bounds reset

---

# 39. Sprint 1 camera

Implement third-person camera:

- smooth follow
- orbit
- impact smoothing
- zoom out for larger launches
- sensible reset after tumble

Do not allow physics vibration to make the camera unpleasant.

---

# 40. Sprint 1 debug HUD

Temporarily display:

```text
Grounded
Velocity
Angular velocity
Hop charge
Impact velocity
Rigid body state
Checkpoint
FPS

```

---

# 41. Sprint 1 acceptance test

Create a staircase.

Attempt to hop Richie upward.

Miss deliberately.

Richie should bounce and tumble down.

If:

**watching Richie fall down the stairs is not funny**

then Sprint 1 is not finished.

Do not proceed.

Fix the movement.

---

# 42. Sprint 2 — Throw Laboratory

One ugly test environment.

Characters:

- Richie
- Voxxy proxy
- Droid proxy
- Biggy proxy

Implement only:

### Voxxy

pick up → aim → throw

### Droid

activate one physical launch mechanism

### Biggy

accelerate → collision → launch Richie

Success criterion:

The three mechanics must immediately feel different.

---

# 43. Sprint 3 — Real Richie model

Before major environment work:

integrate a production-capable Richie model based on the official Reachy Mini assets.

Goals:

- correct proportions
- recognisable head
- recognisable antennas
- recognisable body
- appropriate materials
- separate animated antenna/head parts where useful
- low enough polygon count for browser rendering
- clean collision body separate from render geometry

Prefer:

**official geometry → optimise → convert**

over:

**AI reconstructs robot from photos.**

Product images are verification references, not the primary geometry source.

---

# 44. Sprint 4 — Vertical slice

Build approximately **90 seconds** of near-final gameplay:

```text
Registration
   ↓
Hop
   ↓
Exhibition hall
   ↓
Voxxy throw
   ↓
Stairs
   ↓
Biggy launch
   ↓
Checkpoint

```

Introduce:

- production Richie
- recognisable Voxxy
- recognisable Biggy
- Kinepolis architecture
- Devoxx branding
- lighting
- sound
- particles
- humour messages

This defines the visual quality target.

---

# 45. Later implementation order

After vertical slice:

1. Droid mechanics
2. expanded exhibition floor
3. cinema corridor
4. auditorium
5. crowd-surfing finale
6. opening cinematic
7. closing cinematic
8. sounds
9. stats/results
10. collectibles
11. physical Richie integration
12. optimisation
13. competition packaging

---

# 46. Opening/ending cinematic symmetry

Opening:

camera reveals beautiful keynote stage.

Then:

cut to helpless Richie at registration.

Ending:

return to essentially the same keynote framing.

This time Richie flies violently into shot.

# WHAM

Richie reaches the exact place shown at the start.

This gives the game a complete visual arc.

---

# 47. Sound

Sound effects are disproportionately important.

Key sounds:

Hop:

**boing**

Normal impact:

**bonk**

Biggy:

**WHAM**

Stairs:

**bonk-bonk-bonk-bonk**

Voxxy throw:

**whoosh**

Long flight:

wind intensifies.

Perfect landing:

tiny success sting.

Very bad landing:

brief silence followed by something pathetic.

---

# 48. Performance

Target:

**60 FPS on a normal recent laptop.**

Optimise with:

- instancing
- repeated seating geometry
- simplified collision meshes
- limited dynamic lights
- compressed textures
- GLB
- low-poly background crowd
- object pooling
- distance-based detail where beneficial

Do not sacrifice responsiveness for visual fidelity.

---

# 49. Definition of success

Within five seconds:

> "That robot has no legs."

Within thirty seconds:

someone laughs at a collision.

Within two minutes:

someone discovers Richie can be thrown.

Soon after:

someone asks:

> **"Can Biggy hit him harder?"**

If that happens:

the game works.

---

# 50. Title screen

Display:

# PLEASE

# DO NOT

# THROW

# RICHIE

Pause.

Richie suddenly flies through the title from left to right.

# WHAM

One letter tilts/falls over.

Subtitle:

### An irresponsible Devoxx physics game

---

# 51. FIRST INSTRUCTION TO ASTRA

You are working on the existing repository:

https://github.com/janvanwassenhove/PleaseDoNotThrowRichie

Read this entire brief first.

Do not implement the complete game.

Execute **Sprint 1 only**.

Before implementation:

1. inspect the existing repository
2. preserve anything useful already present
3. establish the proposed structure where appropriate
4. save this brief as `docs/GAME-BRIEF.md`
5. create/update `docs/ARCHITECTURE.md`
6. create `docs/ASSET-SOURCES.md`
7. create `docs/AI-DEVELOPMENT-LOG.md`
8. record the development prompt
9. initialise the browser game stack if not already present

Then implement the Richie physics playground.

Use:

- TypeScript
- Vite
- Three.js
- Rapier

Research/inspect the official Reachy Mini repository before inventing new Richie geometry:

https://github.com/pollen-robotics/reachy_mini

Use the official Devoxx reference library as the canonical source for the other robots and Kinepolis:

[https://game.devoxx.be/references.html](https://game.devoxx.be/references.html)

Do not build Kinepolis yet.

Do not build the opening cinematic yet.

Do not build Voxxy, Droid or Biggy yet.

Do not build physical Reachy integration yet.

Focus entirely on:

# SPACE → BOING → BONK

The first milestone is complete when:

> **Throwing Richie around an ugly grey room is already fun.**
