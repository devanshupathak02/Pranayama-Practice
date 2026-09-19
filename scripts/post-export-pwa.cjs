const fs = require('fs');
const path = require('path');

const WEB_DIR = path.join(__dirname, '..', 'web');
const DIST_DIR = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(DIST_DIR)) {
  console.error('[post-export-pwa] dist directory does not exist!');
  process.exit(1);
}

// 1. Files to copy from web/ to dist/
const FILES_TO_COPY = [
  'manifest.json',
  'sw.js',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
  'favicon.png',
  'favicon-32.png',
  'favicon-16.png',
];

for (const file of FILES_TO_COPY) {
  const src = path.join(WEB_DIR, file);
  const dest = path.join(DIST_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[post-export-pwa] Copied ${file} -> dist/${file}`);
  } else {
    console.warn(`[post-export-pwa] Warning: ${src} not found`);
  }
}

// 2. Patch dist/index.html with PWA meta tags & SW registration
const indexPath = path.join(DIST_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Remove any stale default favicon links
  html = html.replace(/<link rel="icon" href="\/favicon.ico" \/>/g, '');
  html = html.replace(/<!-- PWA & iOS Meta Tags.*?-->/gs, '');

  const pwaHeadTags = `
    <!-- PWA & iOS Meta Tags (Phase C) -->
    <meta name="theme-color" content="#FAF7F2" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Pranayama" />
    <meta name="application-name" content="Pranayama Timer" />
    <meta name="msapplication-TileColor" content="#FAF7F2" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="shortcut icon" href="/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <!-- Google Fonts for Still Mountain Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
  `;

  const swRegistrationScript = `
    <!-- Service Worker Registration -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js')
            .then(function(reg) {
              console.log('[PWA] Service Worker registered with scope:', reg.scope);
            })
            .catch(function(err) {
              console.warn('[PWA] Service Worker registration failed:', err);
            });
        });
      }
    </script>
  `;

  // Clean inject into <head>
  if (!html.includes('link rel="manifest"')) {
    html = html.replace('</head>', `${pwaHeadTags}\n</head>`);
  }

  // Clean inject before </body>
  if (!html.includes('Service Worker Registration')) {
    html = html.replace('</body>', `${swRegistrationScript}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[post-export-pwa] Successfully patched dist/index.html with PWA favicons, meta tags, and SW registration!');
}

console.log('[post-export-pwa] PWA export build completed successfully!');
