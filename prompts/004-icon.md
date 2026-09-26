# 004 — The app icon

Tool: ChatGPT image generation, 2026-09-26, driven by Claude Code in the user's Chrome. The human
instruction behind it, over four rounds:

> Can we improve icon for launching the app, make it funny about real richie throwing, first
> make some propositions before changing. […] Don't like icons, make richie also more realistic.
> […] Keep the funny and humourous spirit of game. […] Make candidates more app icon, not
> photorealistic styling. […] Combination 5/6, change colour pattern. […] A

Rounds: four hand-drawn flat SVG mock-ups (rejected: too flat); four photoreal renders
(rejected: not an icon); three in app-icon style — security holding Richie by an antenna,
Richie flying with coffee and croissant, a prohibition sign — of which the first two were
combined; then two colourways of the combination, Devoxx orange and the keynote gradient.
The master is `src/assets/icon-master.png`; `python scripts/make-icons.py` cuts every size
from it.

The chosen prompt:

> Generate an image: a mobile app icon, square 1:1. Style: a modern app-icon illustration, NOT
> photorealistic — clean stylised 3D, simplified rounded shapes, smooth matte surfaces with soft
> studio shading, bold silhouette, few details, high contrast, like an iOS home-screen icon. No
> text, no letters, no logos, no border, no rounded-corner mask. The character is Richie: a small
> white desk robot, a smooth rounded white shell body with no arms and no legs, a head with two big
> round black camera-lens eyes, two thin springy antennas with round tips. Scene: a burly security
> guard's black-sleeved arm reaches in from the top-right and has just caught Richie by one antenna
> in mid-flight — Richie dangles, eyes wide and indignant, the other antenna flopped, a small orange
> lanyard and badge swinging — while the things he was flying with sail on without him: a paper
> coffee cup tumbling and spilling and a croissant spinning off to the left, with a swooshing motion
> arc. Colourway: a warm Devoxx-orange background (#f0640f) with a subtle darker orange radial
> gradient, Richie bright white, the arc pale cream, the sleeve deep navy (#0d1c27).
