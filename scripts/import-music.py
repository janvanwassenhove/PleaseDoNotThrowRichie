"""Convert the game's music track from WAV to the MP3 the build ships.

    python scripts/import-music.py [--src <file.wav>] [--bitrate 128]

The source WAV is not in this repository (it is 32 MB); only the encoded MP3 is.
Requires `pip install lameenc`, which carries its own LAME build, so no ffmpeg.
"""
import argparse, os, sys, wave
import lameenc

p = argparse.ArgumentParser()
p.add_argument('--src', default=os.path.expanduser('~/Downloads/synaptic_drift.wav'))
p.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'audio', 'synaptic-drift.mp3'))
p.add_argument('--bitrate', type=int, default=128)
a = p.parse_args()

with wave.open(a.src, 'rb') as w:
    ch, sw, rate, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
    if sw != 2:
        sys.exit(f'expected 16-bit PCM, got {sw * 8}-bit')
    pcm = w.readframes(n)
print(f'source: {a.src}  {ch}ch {rate}Hz {n / rate:.1f}s  {len(pcm) // 1024} KB')

enc = lameenc.Encoder()
enc.set_bit_rate(a.bitrate)
enc.set_in_sample_rate(rate)
enc.set_channels(ch)
enc.set_quality(2)                       # 0 slowest/best … 9 fastest
mp3 = enc.encode(pcm) + enc.flush()

out = os.path.normpath(a.out)
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, 'wb') as f:
    f.write(mp3)
print(f'wrote {out}  {a.bitrate} kbps  {len(mp3) // 1024} KB')
