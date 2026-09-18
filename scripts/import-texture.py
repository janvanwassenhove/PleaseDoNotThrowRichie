"""Bring a generated image into the game as a texture.

    python scripts/import-texture.py <name> [--size 1024] [--tile] [--alpha] [--crop WxH] [--src path]

Takes the newest "ChatGPT Image*.png" in ~/Downloads (or --src), resizes it and writes
src/assets/textures/<name>.jpg (or .png with --alpha, which cuts the subject out of a white background).
--tile cross-fades the image with a half-offset copy of itself so opposite edges match:
generated "seamless" textures rarely are, and a carpet seam every four metres shows.
"""
import argparse, glob, os, sys
from PIL import Image, ImageChops, ImageFilter

p = argparse.ArgumentParser()
p.add_argument('name')
p.add_argument('--size', type=int, default=1024)
p.add_argument('--tile', action='store_true')
p.add_argument('--alpha', action='store_true')
p.add_argument('--crop', default=None, help='centre-crop to this aspect first, e.g. 2x1')
p.add_argument('--src', default=None)
p.add_argument('--quality', type=int, default=86)
a = p.parse_args()

src = a.src
if not src:
    found = sorted(glob.glob(os.path.expanduser('~/Downloads/ChatGPT Image*.png')), key=os.path.getmtime)
    if not found: sys.exit('no ChatGPT image in Downloads')
    src = found[-1]
im = Image.open(src).convert('RGBA' if a.alpha else 'RGB')
print('source:', src, im.size)

if a.crop:
    cw, ch = (float(x) for x in a.crop.split('x'))
    w, h = im.size
    if w / h > cw / ch: nw, nh = int(h * cw / ch), h
    else: nw, nh = w, int(w * ch / cw)
    im = im.crop(((w - nw) // 2, (h - nh) // 2, (w - nw) // 2 + nw, (h - nh) // 2 + nh))

w, h = im.size
scale = a.size / max(w, h)
im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)

if a.tile:
    w, h = im.size
    shifted = ImageChops.offset(im, w // 2, h // 2)
    # Mask: keep the original in the middle, fade to the offset copy (whose middle is the
    # original's edges, already continuous) towards the borders.
    mask = Image.new('L', (w, h), 0)
    px = mask.load()
    for y in range(h):
        fy = min(y, h - 1 - y) / (h / 2)
        for x in range(w):
            fx = min(x, w - 1 - x) / (w / 2)
            t = min(fx, fy) * 2.2
            px[x, y] = 255 if t >= 1 else int(255 * (t * t * (3 - 2 * t)))
    im = Image.composite(im, shifted, mask.filter(ImageFilter.GaussianBlur(6)))

if a.alpha:
    # Cut out the studio background: flood-fill near-white in from the borders, so white
    # that belongs to the subject (a belly, a glove) stays opaque.
    from PIL import ImageDraw
    r, g, b, _ = im.split()
    lum = ImageChops.darker(ImageChops.darker(r, g), b)
    mask = lum.point(lambda v: 255 if v > 236 else 0)
    w, h = im.size
    for x in range(0, w, 8):
        for y in (0, h - 1):
            if mask.getpixel((x, y)) == 255: ImageDraw.floodfill(mask, (x, y), 128)
    for y in range(0, h, 8):
        for x in (0, w - 1):
            if mask.getpixel((x, y)) == 255: ImageDraw.floodfill(mask, (x, y), 128)
    alpha = mask.point(lambda v: 0 if v == 128 else 255)
    im.putalpha(alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.9)))

out_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'textures')
os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, a.name + ('.png' if a.alpha else '.jpg'))
if a.alpha: im.save(out, optimize=True)
else: im.save(out, quality=a.quality, optimize=True, progressive=True)
print('wrote', os.path.normpath(out), im.size, os.path.getsize(out) // 1024, 'KB')
