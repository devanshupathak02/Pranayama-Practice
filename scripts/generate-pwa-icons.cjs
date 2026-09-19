const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Use the clean transparent Still Mountain mark
const SOURCE_MARK = path.join(__dirname, '..', 'assets', 'images', 'still-mountain-mark.png');
const ASSETS_ICON = path.join(__dirname, '..', 'assets', 'icon.png');
const ASSETS_ADAPTIVE = path.join(__dirname, '..', 'assets', 'adaptive-icon.png');
const ASSETS_FAVICON = path.join(__dirname, '..', 'assets', 'favicon.png');
const WEB_DIR = path.join(__dirname, '..', 'web');

if (!fs.existsSync(WEB_DIR)) {
  fs.mkdirSync(WEB_DIR, { recursive: true });
}

// Design system background color: #FAF7F2
const BG_COLOR = { r: 250, g: 247, b: 242, a: 255 };

/**
 * Bilinear interpolation resize from transparent source PNG to target PNG with optional scale and background fill.
 */
function renderIcon(srcPng, targetSize, innerScale = 0.90, fillBg = true) {
  const target = new PNG({ width: targetSize, height: targetSize });

  // 1. Initialize background
  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const idx = (targetSize * y + x) << 2;
      if (fillBg) {
        target.data[idx] = BG_COLOR.r;
        target.data[idx + 1] = BG_COLOR.g;
        target.data[idx + 2] = BG_COLOR.b;
        target.data[idx + 3] = BG_COLOR.a;
      } else {
        target.data[idx] = 0;
        target.data[idx + 1] = 0;
        target.data[idx + 2] = 0;
        target.data[idx + 3] = 0;
      }
    }
  }

  // Find tight bounding box of source mark
  let minX = srcPng.width, maxX = 0, minY = srcPng.height, maxY = 0;
  for (let y = 0; y < srcPng.height; y++) {
    for (let x = 0; x < srcPng.width; x++) {
      const idx = (srcPng.width * y + x) << 2;
      if (srcPng.data[idx + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const markW = maxX - minX + 1;
  const markH = maxY - minY + 1;
  const markAspect = markW / markH;

  // Compute destination dimensions preserving aspect ratio
  let destW, destH;
  if (markAspect >= 1) {
    destW = Math.round(targetSize * innerScale);
    destH = Math.round(destW / markAspect);
  } else {
    destH = Math.round(targetSize * innerScale);
    destW = Math.round(destH * markAspect);
  }

  const destOffsetX = Math.round((targetSize - destW) / 2);
  const destOffsetY = Math.round((targetSize - destH) / 2);

  // Resample tight bounding box into destination region
  for (let dy = 0; dy < destH; dy++) {
    for (let dx = 0; dx < destW; dx++) {
      const targetX = destOffsetX + dx;
      const targetY = destOffsetY + dy;
      if (targetX < 0 || targetX >= targetSize || targetY < 0 || targetY >= targetSize) continue;

      const srcNormX = (dx / (destW - 1 || 1)) * (markW - 1);
      const srcNormY = (dy / (destH - 1 || 1)) * (markH - 1);

      const srcX = minX + srcNormX;
      const srcY = minY + srcNormY;

      const x0 = Math.floor(srcX);
      const x1 = Math.min(x0 + 1, srcPng.width - 1);
      const y0 = Math.floor(srcY);
      const y1 = Math.min(y0 + 1, srcPng.height - 1);

      const wx = srcX - x0;
      const wy = srcY - y0;

      const idx00 = (srcPng.width * y0 + x0) << 2;
      const idx10 = (srcPng.width * y0 + x1) << 2;
      const idx01 = (srcPng.width * y1 + x0) << 2;
      const idx11 = (srcPng.width * y1 + x1) << 2;

      const r = (srcPng.data[idx00] * (1 - wx) + srcPng.data[idx10] * wx) * (1 - wy) +
                (srcPng.data[idx01] * (1 - wx) + srcPng.data[idx11] * wx) * wy;
      const g = (srcPng.data[idx00 + 1] * (1 - wx) + srcPng.data[idx10 + 1] * wx) * (1 - wy) +
                (srcPng.data[idx01 + 1] * (1 - wx) + srcPng.data[idx11 + 1] * wx) * wy;
      const b = (srcPng.data[idx00 + 2] * (1 - wx) + srcPng.data[idx10 + 2] * wx) * (1 - wy) +
                (srcPng.data[idx01 + 2] * (1 - wx) + srcPng.data[idx11 + 2] * wx) * wy;
      const a = (srcPng.data[idx00 + 3] * (1 - wx) + srcPng.data[idx10 + 3] * wx) * (1 - wy) +
                (srcPng.data[idx01 + 3] * (1 - wx) + srcPng.data[idx11 + 3] * wx) * wy;

      const targetIdx = (targetSize * targetY + targetX) << 2;
      const alpha = a / 255;

      if (fillBg) {
        target.data[targetIdx] = Math.round(r * alpha + BG_COLOR.r * (1 - alpha));
        target.data[targetIdx + 1] = Math.round(g * alpha + BG_COLOR.g * (1 - alpha));
        target.data[targetIdx + 2] = Math.round(b * alpha + BG_COLOR.b * (1 - alpha));
        target.data[targetIdx + 3] = 255;
      } else {
        target.data[targetIdx] = Math.round(r);
        target.data[targetIdx + 1] = Math.round(g);
        target.data[targetIdx + 2] = Math.round(b);
        target.data[targetIdx + 3] = Math.round(a);
      }
    }
  }

  return target;
}

function generateIcons() {
  console.log('[generate-pwa-icons] Reading source mark:', SOURCE_MARK);
  const data = fs.readFileSync(SOURCE_MARK);
  const srcPng = PNG.sync.read(data);

  console.log(`[generate-pwa-icons] Source mark dimensions: ${srcPng.width}x${srcPng.height}`);

  // Enlarge mark: 86% scale for crisp, prominent icon display without border boxes
  const targets = [
    { dest: path.join(WEB_DIR, 'icon-192.png'), size: 192, scale: 0.86, fillBg: true },
    { dest: path.join(WEB_DIR, 'icon-512.png'), size: 512, scale: 0.86, fillBg: true },
    // Maskable icon: 72% scale for Android adaptive circular crop
    { dest: path.join(WEB_DIR, 'icon-maskable-512.png'), size: 512, scale: 0.72, fillBg: true },
    // iOS apple-touch-icon: 88% scale for full, prominent look on iOS home screen
    { dest: path.join(WEB_DIR, 'apple-touch-icon.png'), size: 180, scale: 0.88, fillBg: true },
    // Favicons
    { dest: path.join(WEB_DIR, 'favicon-32.png'), size: 32, scale: 0.90, fillBg: true },
    { dest: path.join(WEB_DIR, 'favicon-16.png'), size: 16, scale: 0.90, fillBg: true },
    { dest: path.join(WEB_DIR, 'favicon.png'), size: 48, scale: 0.90, fillBg: true },
    // Sync to assets/
    { dest: ASSETS_ICON, size: 1024, scale: 0.86, fillBg: true },
    { dest: ASSETS_ADAPTIVE, size: 1024, scale: 0.72, fillBg: true },
    { dest: ASSETS_FAVICON, size: 48, scale: 0.90, fillBg: true },
  ];

  for (const t of targets) {
    const outPng = renderIcon(srcPng, t.size, t.scale, t.fillBg);
    const buffer = PNG.sync.write(outPng);
    fs.writeFileSync(t.dest, buffer);
    console.log(`[generate-pwa-icons] Generated -> ${t.dest} (${t.size}x${t.size})`);
  }

  console.log('[generate-pwa-icons] All icons regenerated with clean transparent Still Mountain mark!');
}

generateIcons();
