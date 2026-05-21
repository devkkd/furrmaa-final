# 📸 Images Setup Guide

## Folder Structure

```
Farmaa/
└── src/
    └── assets/
        └── images/
            ├── splash1.png    (Main splash logo)
            ├── splash2.png    (Secondary splash/onboarding images)
            └── README.md
```

## Images Required

### 1. splash1.png

- **Purpose:** Main splash screen logo
- **Content:** FURRMAA logo with animal heads (dog, cat, bird)
- **Size:** 120x120px (or higher resolution)
- **Format:** PNG with transparent background

### 2. splash2.png (or multiple images)

- **Purpose:** Onboarding screens images
- **Content:**
  - Slide 1: Pets with food/toys
  - Slide 2: Training scene
  - Slide 3: Pet reels
  - Slide 4: Vet consultation
- **Size:** 375x400px (or higher)
- **Format:** PNG/JPG

## How to Add Images

### Step 1: Images Copy Karein

1. Images ko `src/assets/images/` folder me copy karein
2. Filenames exactly: `splash1.png`, `splash2.png`

### Step 2: Code Me Uncomment Karein

**SplashScreen.tsx me:**

```javascript
// Line 11-12 uncomment karein:
import splash1 from '../assets/images/splash1.png';

// Line 50-54 uncomment karein:
<Image source={splash1} style={styles.logoImage} resizeMode="contain" />;
```

**OnboardingScreen.tsx me:**

```javascript
// Line 11-12 uncomment karein:
import splash2 from '../../assets/images/splash2.png';

// Line 90-94 uncomment karein:
<Image
  source={slide.imageSource}
  style={styles.slideImage}
  resizeMode="contain"
/>;
```

## Image Requirements

### Resolution:

- **@1x:** Base resolution
- **@2x:** 2x resolution (better quality)
- **@3x:** 3x resolution (best quality)

### Formats:

- **PNG:** Transparent background ke liye
- **JPG:** Photos ke liye
- **SVG:** Vector images (React Native SVG use karein)

## Testing

Images add karne ke baad:

1. App restart karein
2. Splash screen check karein
3. Onboarding screens check karein

## Troubleshooting

### Image load nahi ho rahi?

- File path check karein
- Filename exactly match karein
- File extension (.png) check karein
- Metro bundler restart karein: `npm start --reset-cache`

### Image blur hai?

- Higher resolution image use karein
- @2x ya @3x versions add karein

