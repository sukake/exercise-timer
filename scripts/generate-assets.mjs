// Regenerates every app/PWA icon + the splash image from a single source logo.
//
//   node scripts/generate-assets.mjs [path-to-source-logo]   (default: assets/source-logo.png)
//
// The source logo (stopwatch + flexed arm) ships on a dark-gray radial gradient.
// The app theme is navy #0f172a, so we key out that gray background with a
// border flood-fill and rebuild it as navy (opaque master) or transparent
// (for Android adaptive/maskable foregrounds). Everything else is derived from
// those two masters so all platforms stay visually consistent.
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'assets');
const src = process.argv[2] || join(assets, 'source-logo.png');

const NAVY = { r: 0x0f, g: 0x17, b: 0x2a };            // #0f172a
const NAVY_HEX = '#0f172a';

// --- mark vs. surround ------------------------------------------------------
// Rather than keying the gray by colour (fragile — the source has a soft
// drop-shadow/glow that blends gray -> mark), we key the COMPLEMENT: a pixel is
// "mark core" if it's clearly part of the emblem, i.e. saturated (navy/orange),
// near-white (arm/highlights), or the very-dark outer stroke that rings it.
// Background gray + shadow + glow are none of these. We then flood-fill from the
// border through everything that is NOT mark-core: it swallows the gray AND the
// entire shadow, halting exactly at the emblem's stroke. Connectivity keeps it
// out of the enclosed interior (the stopwatch face navy).
function isMarkCore(r, g, b) {
  const mx = Math.max(r, g, b);
  const sat = mx - Math.min(r, g, b);
  return sat >= 55 || mx >= 195 || mx <= 44; // saturated | near-white | dark stroke
}

// Border flood-fill through non-core pixels -> Uint8 mask (1 = surround).
function surroundMask(data, W, H, C) {
  const mask = new Uint8Array(W * H);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x;
    if (mask[p]) return;
    const i = p * C;
    if (isMarkCore(data[i], data[i + 1], data[i + 2])) return; // stop at the mark
    mask[p] = 1;
    stack.push(x, y);
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return mask;
}

// Grow the mask `steps` px into neighbours that pass `absorb` (default: any).
function grow(mask, data, W, H, C, steps, absorb = () => true) {
  let cur = mask;
  for (let step = 0; step < steps; step++) {
    const next = cur.slice();
    let changed = false;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const p = y * W + x;
        if (cur[p]) continue;
        if (!((x > 0 && cur[p - 1]) || (x < W - 1 && cur[p + 1]) ||
              (y > 0 && cur[p - W]) || (y < H - 1 && cur[p + W]))) continue;
        const i = p * C;
        if (!absorb(data[i], data[i + 1], data[i + 2])) continue;
        next[p] = 1; changed = true;
      }
    }
    cur = next;
    if (!changed) break;
  }
  return cur;
}

// Build the two masters (trimmed to the mark's bounding box) once.
async function buildMasters() {
  const { data, info } = await sharp(src).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  let mask = surroundMask(data, W, H, C);
  // Eat the 1-2px anti-aliased seam between shadow and stroke, but only into
  // non-core pixels so the mark's edge stays crisp.
  mask = grow(mask, data, W, H, C, 2, (r, g, b) => !isMarkCore(r, g, b));

  const navy = Buffer.from(data);        // bg -> navy, opaque
  const trans = Buffer.from(data);       // bg -> transparent
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x, i = p * C;
      if (mask[p]) {
        navy[i] = NAVY.r; navy[i + 1] = NAVY.g; navy[i + 2] = NAVY.b; navy[i + 3] = 255;
        trans[i] = NAVY.r; trans[i + 1] = NAVY.g; trans[i + 2] = NAVY.b; trans[i + 3] = 0;
      } else {                            // track mark bounding box for trimming
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  const raw = (buf) => sharp(buf, { raw: { width: W, height: H, channels: C } });
  const bbox = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };

  return {
    // full-frame master on navy (mark bleeds to edges, like the source)
    navyFull: () => raw(navy).png(),
    // tightly-cropped transparent mark, for padding into safe zones
    markPng: await raw(trans).extract(bbox).png().toBuffer(),
  };
}

async function run() {
  const M = await buildMasters();

  // Helper: place the transparent mark centered on a `size` square filled `bg`,
  // occupying `content` fraction of the frame. bg=null => transparent canvas.
  const composed = async (size, content, bg) => {
    const inner = Math.round(size * content);
    const resized = await sharp(M.markPng)
      .resize(inner, inner, { fit: 'contain', background: '#00000000' })
      .toBuffer();
    return sharp({
      create: { width: size, height: size, channels: 4,
        background: bg ? NAVY_HEX : '#00000000' },
    }).composite([{ input: resized, gravity: 'center' }]).png();
  };

  const out = (name) => join(assets, name);
  const jobs = [];

  // In-app logo — trimmed mark on transparent, square canvas (sits on the dark
  // theme bg or cards). Used by the <Logo> component across screens.
  jobs.push(['logo-mark.png', await composed(512, 0.94, false)]);

  // App icon — full-bleed mark on navy (matches the source framing).
  jobs.push(['icon.png', M.navyFull().resize(1024, 1024)]);

  // Splash — mark with generous padding on navy (resizeMode: contain).
  jobs.push(['splash-icon.png', await composed(1024, 0.52, true)]);

  // Android adaptive icon: foreground = transparent mark inside the 66% safe
  // zone; background = solid navy; monochrome = white silhouette (themed icon).
  jobs.push(['adaptive-foreground.png', await composed(1024, 0.60, false)]);
  jobs.push(['android-icon-foreground.png', await composed(1024, 0.60, false)]);
  jobs.push(['android-icon-background.png',
    sharp({ create: { width: 1024, height: 1024, channels: 4, background: NAVY_HEX } }).png()]);

  // Web / PWA
  jobs.push(['apple-touch-icon.png', M.navyFull().resize(180, 180)]);
  jobs.push(['icon-192.png', M.navyFull().resize(192, 192)]);
  jobs.push(['icon-512.png', M.navyFull().resize(512, 512)]);
  jobs.push(['icon-maskable-512.png', await composed(512, 0.66, true)]); // safe-zone padded
  jobs.push(['favicon.png', M.navyFull().resize(48, 48)]);
  jobs.push(['pwa-favicon.png', M.navyFull().resize(48, 48)]);

  for (const [name, pipe] of jobs) {
    await pipe.png().toFile(out(name));
    console.log('✓', name);
  }

  // Monochrome (Android themed icon): white silhouette from the mark's alpha.
  const monoInner = Math.round(1024 * 0.60);
  const silhouette = await sharp(M.markPng)
    .resize(monoInner, monoInner, { fit: 'contain', background: '#00000000' })
    .ensureAlpha()
    // recolor every visible pixel to white, keep alpha
    .composite([{ input: { create: { width: monoInner, height: monoInner, channels: 4, background: '#ffffffff' } }, blend: 'in' }])
    .toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#00000000' } })
    .composite([{ input: silhouette, gravity: 'center' }])
    .png().toFile(out('android-icon-monochrome.png'));
  console.log('✓ android-icon-monochrome.png');
}

run().catch((e) => { console.error(e); process.exit(1); });
