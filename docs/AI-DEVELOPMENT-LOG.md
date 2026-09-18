# AI development log

## Iteration 1 — Physics first

Date: 2026-09-17. Goal: prove SPACE → BOING → BONK. AI/tool: Codex. Prompt: prompts/001-implementation.md. Generated: fixed-step Rapier world, charged hop, air influence, tumble recovery, camera and checkpoints. Observed problems: an earlier recovery stopped while tilted and render-tick input could miss a release. Human decision: implement the full brief, superseding its embedded Sprint-1-only handoff. Changes: continue recovery until upright and retain release edges until a physics step. Result: physics and ballistic math covered by tests.

## Iteration 2 — Full journey and recovery

Date: 2026-09-18. Goal: complete registration-to-keynote gameplay. Generated: eight areas, three assists, opening, finale, stats and collectibles. Observed problem: the first implementation was browser-tested locally but its temporary workspace was erased after publication was blocked. Human decision: user explicitly approved publication to main and requested reconstruction. Changes: rebuilt a compact procedural version from the preserved brief and retained the earlier physics corrections. Result: runnable static browser game.
