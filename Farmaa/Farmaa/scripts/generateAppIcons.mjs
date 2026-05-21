/**
 * Generate Android launcher + adaptive icons and iOS AppIcon from Logo.png.
 * Run from Farmaa/Farmaa: npm run generate:icons
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ANDROID_RES = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

const LOGO_CANDIDATES = [
  path.join(ROOT, 'src', 'assets', 'logo.png'),
  path.join(ROOT, 'src', 'assets', 'images', 'logo.png'),
  path.join(ROOT, 'src', 'assets', 'images', 'Logo.png'),
];

const MIPMAP_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const FOREGROUND_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

function findLogo() {
  for (const p of LOGO_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `Logo not found. Add src/assets/images/Logo.png or src/assets/logo.png`
  );
}

async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    throw new Error(
      'sharp is required. Run: npm install sharp@0.34.2 --save-dev'
    );
  }
}

async function writePng(sharp, input, size, outPath) {
  const padding = Math.round(size * 0.12);
  const inner = size - padding * 2;
  await sharp(input)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(outPath);
}

async function writeForeground(sharp, input, size, outPath) {
  const safe = Math.round(size * 0.72);
  const pad = Math.round((size - safe) / 2);
  await sharp(input)
    .resize(safe, safe, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outPath);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeAndroidXml() {
  const valuesDir = path.join(ANDROID_RES, 'values');
  ensureDir(valuesDir);
  fs.writeFileSync(
    path.join(valuesDir, 'colors.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
`
  );

  const adaptiveDir = path.join(ANDROID_RES, 'mipmap-anydpi-v26');
  ensureDir(adaptiveDir);
  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(path.join(adaptiveDir, 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(adaptiveDir, 'ic_launcher_round.xml'), adaptiveXml);
}

async function main() {
  const logoPath = findLogo();
  const sharp = await loadSharp();
  console.log('Using logo:', logoPath);

  const logoDest = path.join(ROOT, 'src', 'assets', 'logo.png');
  if (path.resolve(logoPath) !== path.resolve(logoDest)) {
    ensureDir(path.dirname(logoDest));
    fs.copyFileSync(logoPath, logoDest);
  }

  writeAndroidXml();

  for (const [folder, size] of Object.entries(MIPMAP_SIZES)) {
    const dir = path.join(ANDROID_RES, folder);
    ensureDir(dir);
    await writePng(sharp, logoPath, size, path.join(dir, 'ic_launcher.png'));
    await writePng(sharp, logoPath, size, path.join(dir, 'ic_launcher_round.png'));
    console.log('Wrote', folder, 'launcher', size);
  }

  for (const [folder, size] of Object.entries(FOREGROUND_SIZES)) {
    const dir = path.join(ANDROID_RES, folder);
    ensureDir(dir);
    await writeForeground(
      sharp,
      logoPath,
      size,
      path.join(dir, 'ic_launcher_foreground.png')
    );
    console.log('Wrote', folder, 'foreground', size);
  }

  const iosIconDir = path.join(ROOT, 'ios', 'Farmaa', 'Images.xcassets', 'AppIcon.appiconset');
  if (fs.existsSync(path.dirname(iosIconDir))) {
    ensureDir(iosIconDir);
    const iosSizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];
    const contents = { images: [], info: { version: 1, author: 'xcode' } };
    for (const s of iosSizes) {
      const name = `icon-${s}.png`;
      await sharp(logoPath)
        .resize(s, s, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(path.join(iosIconDir, name));
      const idiom = s === 1024 ? 'ios-marketing' : 'iphone';
      contents.images.push({
        size: `${s}x${s}`,
        idiom,
        filename: name,
        scale: '1x',
      });
    }
    fs.writeFileSync(
      path.join(iosIconDir, 'Contents.json'),
      JSON.stringify(contents, null, 2)
    );
    console.log('Wrote iOS AppIcon set');
  }

  console.log('Done. Rebuild: cd android && gradlew clean && cd .. && npm run android');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
