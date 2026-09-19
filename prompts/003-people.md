# 003 — Skin and cloth for the crowd

Tool: ChatGPT image generation, one conversation, 2026-09-19, driven by Claude Code in the user's Chrome. Each prompt produced one image, which `scripts/import-texture.py`
brings into `src/assets/textures/` under the name given. The human instruction behind it:

> make the humans all hyperrealistic

The crowd (`src/people.ts`) draws every person with one material whose map is an atlas of these
seven surfaces. At import the game converts each to grey relief around a fixed mean, so the image's
own colour does not matter — the vertex colour supplies the skin tone, the shirt colour, the hair
colour — and the same image doubles as the bump map. Without a file the tile stays white and that
surface is flat-shaded, so any subset can be generated in any order.

All seven: `python scripts/import-texture.py <name> --size 512 --tile`.

Shared preamble, stated once and referred to as "same rules" afterwards:

> A seamless, tileable, photorealistic close-up texture, shot flat head-on with flat even lighting and
> no shadows, no vignette, no depth of field. No objects, no seams, no borders, no text, no logos.
> Square 1:1, edges must tile seamlessly. Uniform across the whole frame: no folds, no edges of
> the material, no highlights that would give away a light direction.

- **people-skin** — human skin at a few centimetres: pores, the faint diamond pattern of fine lines,
  very slight tone variation, no hair, no moles, no freckles, no blemishes. Mid-tone, matte.
- **people-cotton** — plain cotton jersey, the knit of a t-shirt, mid grey heather, fine and even.
- **people-denim** — indigo denim, the diagonal twill clearly visible, slightly faded, no seams.
- **people-fleece** — hoodie fleece / brushed french terry, soft nap, mid grey, no stitching.
- **people-wool** — suit-jacket worsted wool, charcoal, a fine plain or herringbone weave.
- **people-hair** — straight human hair at a few centimetres, dark brown, strands running vertically,
  dense and even, no parting, no scalp.
- **people-leather** — smooth fine-grained black shoe leather, matte, no stitching.
