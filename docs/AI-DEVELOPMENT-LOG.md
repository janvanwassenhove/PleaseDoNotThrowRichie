# AI development log

## Iteration 1 — Physics first

Date: 2026-09-17. Goal: prove SPACE → BOING → BONK. AI/tool: Codex. Prompt: prompts/001-implementation.md. Generated: fixed-step Rapier world, charged hop, air influence, tumble recovery, camera and checkpoints. Observed problems: an earlier recovery stopped while tilted and render-tick input could miss a release. Human decision: implement the full brief, superseding its embedded Sprint-1-only handoff. Changes: continue recovery until upright and retain release edges until a physics step. Result: physics and ballistic math covered by tests.

## Iteration 2 — Full journey and recovery

Date: 2026-09-18. Goal: complete registration-to-keynote gameplay. Generated: eight areas, three assists, opening, finale, stats and collectibles. Observed problem: the first implementation was browser-tested locally but its temporary workspace was erased after publication was blocked. Human decision: user explicitly approved publication to main and requested reconstruction. Changes: rebuilt a compact procedural version from the preserved brief and retained the earlier physics corrections. Result: runnable static browser game.

## Iteration 3 — Hosting and releases

Date: 2026-09-18. Goal: make the game reachable without a checkout, and cut releases the way the other games do. AI/tool: Claude Code. Generated: a GitHub Pages deploy workflow, a release workflow that bumps, tags, screenshots, zips the site and publishes notes, an artifact cleanup workflow, a Playwright screenshot script and a `window.__richie` debug hook. Observed problems: the HUD stayed up over the opening cinematic; the chase camera lerps too slowly to settle on a software renderer, so captures framed the wrong thing; a charge held before a reset survived it; a failed boot showed an unexplained black page. Human decision: keep the screenshots deterministic by driving game state directly rather than synthesising input. Changes: one `play()` entry point that clears every overlay, a shared chase-camera target the debug hook can snap to, `reset()` clears the charge, and a boot overlay that reports WebGL and start-up failures. Result: the built site deploys to GitHub Pages on every push to main, and each push publishes a release carrying seven captures and the playable build.
