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

// CI captures on a software renderer: a single frame can take seconds, so every wait,
// and the screenshot itself (which waits for a frame), gets a generous budget. The finale
// alone is nine seconds of game time at a fifth of a second a frame, with two spotlights
// on a full stage: eight minutes covers a slow runner.
const SLOW = 480_000;

async function shot(page, name) {
  await page.screenshot({path: `${OUT}/${name}.png`, timeout: SLOW});
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
page.setDefaultTimeout(SLOW);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

try {
  await mkdir(OUT, {recursive: true});
  await page.goto(url, {waitUntil: 'load'});

  // Rapier's wasm init and the first rendered frame both have to land before the
  // debug hook exists; the boot overlay removing itself is the signal.
  await page.waitForFunction(() => window.__richie && !document.getElementById('boot'), null, {timeout: SLOW});
  await settle(page);
  await shot(page, '01-title');

  // The briefing: Biggy's card, shot live in the foyer.
  await drive(page, 'tutorial', 3);
  await settle(page, 1500);
  await shot(page, '11-briefing');
  await page.keyboard.press('Escape');                 // back to the title
  await page.waitForFunction(() => window.__richie.state === 'title', null, {timeout: SLOW});

  // Opening cinematic, held on the shot that states the problem.
  await drive(page, 'cinematic', 5);
  await settle(page, 800);
  await shot(page, '02-opening');

  // Exhibition floor, hop charged: the core loop in one frame.
  await drive(page, 'warp', 1);
  await settle(page);                          // let Richie land before framing him
  await drive(page, 'camera', -0.3, 0.3, 7);  // snaps the chase camera into place
  await settle(page, 400);
  await drive(page, 'charging', 0.75);
  await settle(page, 300);
  await shot(page, '03-exhibition');

  // The Voxxy gap, where the title stops being a request.
  await drive(page, 'warp', 2);
  await settle(page);
  await drive(page, 'camera', -0.35, 0.26, 8);
  await settle(page, 400);
  await shot(page, '04-voxxy');

  // Security: a guard has just spotted Richie on the exhibition floor.
  await drive(page, 'alarm');
  await drive(page, 'camera', 0.6, 0.25, 9);
  await page.waitForFunction(() => ['alert', 'chase'].includes(window.__richie.guards[1][0]), null, {timeout: SLOW});
  await shot(page, '05-security');

  // The grand staircase: twenty-four steps, no legs.
  await drive(page, 'warp', 3);
  await settle(page);
  await drive(page, 'camera', 0, 0.25, 9);
  await settle(page, 400);
  await drive(page, 'hop', 1);
  // Wait on Richie's actual height, not on a timer: a software renderer's frame
  // rate is nobody's guess.
  await page.waitForFunction(() => window.__richie.pose().y > 2, null, {timeout: SLOW});
  await shot(page, '06-staircase');

  // Cinema corridor, lined with Voxxy and Droid, the auditorium dead ahead.
  await drive(page, 'warp', 5);
  await settle(page);
  await drive(page, 'camera', 0.2, 0.26, 7.5);
  await settle(page, 400);
  await drive(page, 'hop', 1);
  await page.waitForFunction(() => window.__richie.pose().y > 15, null, {timeout: SLOW});
  await shot(page, '07-corridor');

  // Auditorium 8 from the doors at the top: the room rakes down to the keynote stage.
  await drive(page, 'warp', 6);
  await settle(page);
  await drive(page, 'look', 0, 16.5, 184, 0, 8, 256);
  await settle(page, 700);
  await shot(page, '08-auditorium');

  // The grand finale: Richie makes the stage and the whole expedition joins him.
  await drive(page, 'set', {
    tokens: 6,
    stats: {time: 214, hops: 143, faceplants: 27, throws: 4, impacts: 3, stairs: 9, coffees: 5, croissants: 2},
  });
  await drive(page, 'finale');
  await page.waitForFunction(() => window.__richie.state === 'end', null, {timeout: SLOW});
  // Give the robots time to run in from the wings; the party camera is already sweeping.
  await page.waitForFunction(() => {
    const r = window.__richie.robots;
    return r.every(([x]) => Math.abs(x) < 6);
  }, null, {timeout: SLOW});
  await settle(page, 800);
  await shot(page, '09-finale');

  // End card over the party.
  await page.waitForFunction(() => window.__richie.state === 'results', null, {timeout: SLOW});
  await settle(page, 800);
  await shot(page, '10-keynote');

  if (errors.length) throw new Error(`the page reported errors:\n  ${errors.join('\n  ')}`);
  console.log(`\nWrote screenshots to ${OUT}/`);
} finally {
  await browser.close();
  await server.close();
}
