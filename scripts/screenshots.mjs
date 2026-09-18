// Captures the screenshots that go into the release notes.
//
// Boots a real Vite dev server and drives the game through the `window.__richie`
// debug hook (see src/main.ts) rather than synthesising key presses against a
// physics simulation, so the captures are deterministic and survive HUD changes.
//
//   node scripts/screenshots.mjs [outDir]      (default: screenshots/)
//
// CHROMIUM_PATH can point at an already-installed Chromium; without it Playwright
// uses the browser from `npx playwright install chromium`.
import {mkdir} from 'node:fs/promises';
import {createServer} from 'vite';
import {chromium} from 'playwright';

const OUT = process.argv[2] ?? 'screenshots';
const VIEWPORT = {width: 1280, height: 720};

const settle = (page, ms = 1200) => page.waitForTimeout(ms);
const drive = (page, fn, ...args) => page.evaluate(([f, a]) => window.__richie[f](...a), [fn, args]);

async function shot(page, name) {
  await page.screenshot({path: `${OUT}/${name}.png`});
  console.log(`  ✓ ${name}.png`);
}

const server = await createServer({logLevel: 'silent', server: {port: 5199}});
await server.listen();
const url = server.resolvedUrls.local[0];
console.log(`dev server: ${url}`);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  // Headless runners have no GPU; SwiftShader gives WebGL 2 in software.
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({viewport: VIEWPORT, deviceScaleFactor: 1});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

try {
  await mkdir(OUT, {recursive: true});
  await page.goto(url, {waitUntil: 'load'});

  // Rapier's wasm init and the first rendered frame both have to land before the
  // debug hook exists; the boot overlay removing itself is the signal.
  await page.waitForFunction(() => window.__richie && !document.getElementById('boot'), null, {timeout: 60_000});
  await settle(page);
  await shot(page, '01-title');

  // Opening cinematic, held on the shot that states the problem.
  await drive(page, 'cinematic', 5);
  await settle(page, 800);
  await shot(page, '02-opening');

  // Exhibition floor, hop charged: the core loop in one frame.
  await drive(page, 'warp', 1);
  await settle(page);                          // let Richie land before framing him
  await drive(page, 'camera', -0.3, 0.3, 10);  // snaps the chase camera into place
  await settle(page, 400);
  await drive(page, 'charging', 0.75);
  await settle(page, 300);
  await shot(page, '03-exhibition');

  // The Voxxy gap, where the title stops being a request.
  await drive(page, 'warp', 2);
  await settle(page);
  await drive(page, 'camera', -0.35, 0.28, 11);
  await settle(page, 400);
  await shot(page, '04-voxxy');

  // The grand staircase: twenty-four steps, no legs.
  await drive(page, 'warp', 3);
  await settle(page);
  await drive(page, 'camera', 0, 0.25, 12);
  await settle(page, 400);
  await drive(page, 'hop', 1);
  // Wait on Richie's actual height, not on a timer: a software renderer's frame
  // rate is nobody's guess.
  await page.waitForFunction(() => window.__richie.pose().y > 2, null, {timeout: 15_000});
  await shot(page, '05-staircase');

  // Cinema corridor, lined with Voxxy and Droid, the auditorium dead ahead.
  await drive(page, 'warp', 5);
  await settle(page);
  await drive(page, 'camera', 0.2, 0.28, 10);
  await settle(page, 400);
  await drive(page, 'hop', 1);
  await page.waitForFunction(() => window.__richie.pose().y > 15, null, {timeout: 15_000});
  await shot(page, '06-corridor');

  // End card, with a plausible run behind it and the auditorium as the backdrop.
  await drive(page, 'warp', 7);
  await settle(page);
  await drive(page, 'camera', 0, 0.3, 14);
  await drive(page, 'set', {
    tokens: 6,
    stats: {time: 214, hops: 143, faceplants: 27, throws: 4, impacts: 3, stairs: 9, coffees: 5, croissants: 2},
  });
  await drive(page, 'results');
  await settle(page, 600);
  await shot(page, '07-keynote');

  if (errors.length) throw new Error(`the page reported errors:\n  ${errors.join('\n  ')}`);
  console.log(`\nWrote screenshots to ${OUT}/`);
} finally {
  await browser.close();
  await server.close();
}
