/**
 * Copy logo.png / Logo.png into all Android mipmap folders (no sharp required).
 * Run: npm run copy:icons
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

const MIPMAP_DIRS = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi',
];

const ICON_NAMES = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];

function findLogo() {
  for (const p of LOGO_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Logo not found. Add src/assets/logo.png or src/assets/images/Logo.png');
}

const logoPath = findLogo();
console.log('Using logo:', logoPath);

for (const folder of MIPMAP_DIRS) {
  const dir = path.join(ANDROID_RES, folder);
  fs.mkdirSync(dir, { recursive: true });
  for (const name of ICON_NAMES) {
    fs.copyFileSync(logoPath, path.join(dir, name));
  }
  console.log('Wrote', folder);
}

console.log('Done. Rebuild: cd android && gradlew.bat assembleDebug');
