// Turns the plain `expo export --platform web` output in dist/ into an
// installable PWA: copies the manifest, service worker and icons, then injects
// the required <head> tags and the service-worker registration into index.html.
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const web = join(root, 'web');
const assets = join(root, 'assets');

if (!existsSync(dist)) {
  console.error('✖ dist/ not found — run `expo export --platform web` first.');
  process.exit(1);
}

const copies = [
  [join(web, 'manifest.webmanifest'), 'manifest.webmanifest'],
  [join(web, 'sw.js'), 'sw.js'],
  [join(assets, 'icon-192.png'), 'icon-192.png'],
  [join(assets, 'icon-512.png'), 'icon-512.png'],
  [join(assets, 'icon-maskable-512.png'), 'icon-maskable-512.png'],
  [join(assets, 'apple-touch-icon.png'), 'apple-touch-icon.png'],
];

for (const [from, to] of copies) {
  await copyFile(from, join(dist, to));
}

const indexPath = join(dist, 'index.html');
let html = await readFile(indexPath, 'utf8');

const head = `
    <meta name="theme-color" content="#0f172a" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Exercise Timer" />
    <link rel="manifest" href="manifest.webmanifest" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="icon-192.png" />`;

const swReg = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('sw.js').catch(function () {});
        });
      }
    </script>`;

if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', head + '\n  </head>');
}
if (!html.includes("serviceWorker")) {
  html = html.replace('</body>', swReg + '\n  </body>');
}

await writeFile(indexPath, html, 'utf8');
console.log('✓ PWA files injected into dist/. Ready to host or zip.');
