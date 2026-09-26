"""Cut the app icons from the master artwork.

    python scripts/make-icons.py

Reads src/assets/icon-master.png (a square, generated with ChatGPT: prompts/004-icon.md) and
writes public/icons/icon-192.png, icon-512.png, icon-180.png (Apple touch), a maskable 512
with the artwork held inside the safe zone on the artwork's own edge colour, and a 64px
public/favicon.png. Everything the manifest and index.html point at.
"""
import os
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = Image.open(os.path.join(ROOT, 'src/assets/icon-master.png')).convert('RGB')
w, h = src.size
s = min(w, h)
src = src.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
out = os.path.join(ROOT, 'public/icons')
os.makedirs(out, exist_ok=True)

for name, size in [('icon-512', 512), ('icon-192', 192), ('icon-180', 180)]:
    src.resize((size, size), Image.LANCZOS).save(os.path.join(out, f'{name}.png'), optimize=True)
    print(f'  wrote public/icons/{name}.png')
src.resize((64, 64), Image.LANCZOS).save(os.path.join(ROOT, 'public/favicon.png'), optimize=True)
print('  wrote public/favicon.png')

# Maskable: launchers may crop to a circle or a squircle, keeping only the central 80%.
# The artwork sits inside that, on a background made from its own edges (blurred, so the
# radial gradient continues rather than ending in a square).
size, inner = 512, 400
bg = src.resize((size, size), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
edge = Image.new('RGB', (size, size), src.getpixel((4, 4)))
bg = Image.blend(edge, bg, .35)
art = src.resize((inner, inner), Image.LANCZOS)
bg.paste(art, ((size - inner) // 2, (size - inner) // 2))
bg.save(os.path.join(out, 'icon-maskable-512.png'), optimize=True)
print('  wrote public/icons/icon-maskable-512.png')
