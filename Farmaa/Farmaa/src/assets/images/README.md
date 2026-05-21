# Images Assets Folder

## Splash Screen Images

Ye folder me images add karein:

1. **splash1.png** - Main splash screen logo (FURRMAA logo with animals)
2. **splash2.png** - Secondary splash image

## Image Requirements

- Format: PNG (transparent background preferred)
- Resolution:
  - @1x: 375x812 (iPhone X)
  - @2x: 750x1624
  - @3x: 1125x2436
- Or use vector images for better scaling

## How to Add Images

1. Images ko `src/assets/images/` folder me copy karein
2. Filenames: `splash1.png`, `splash2.png`
3. React Native me import karein:
   ```javascript
   import splash1 from '../assets/images/splash1.png';
   ```

