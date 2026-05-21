# Metro Bundler Cache Clear - Fix Syntax Error

## Problem

Metro bundler is showing old cached version with "networkimport" error.

## Solution - Clear Cache

### Method 1: Reset Cache (Recommended)

```bash
cd Farmaa
npm start -- --reset-cache
```

### Method 2: Complete Clean

```bash
cd Farmaa

# Stop Metro bundler (Ctrl+C if running)

# Clear watchman (if installed)
watchman watch-del-all

# Clear Metro cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Clear node_modules cache
rm -rf node_modules/.cache

# Restart
npm start -- --reset-cache
```

### Method 3: Windows PowerShell

```powershell
cd Farmaa

# Stop Metro bundler

# Clear cache
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Restart with cache reset
npm start -- --reset-cache
```

### Method 4: Complete Rebuild

```bash
cd Farmaa

# Clean everything
rm -rf node_modules
rm -rf android/app/build
rm -rf ios/build

# Reinstall
npm install

# Start fresh
npm start -- --reset-cache
```

## After Clearing Cache

1. Stop Metro bundler (Ctrl+C)
2. Run: `npm start -- --reset-cache`
3. In another terminal: `npm run android` (or `npm run ios`)

## Verify File is Correct

Check line 1 of `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useState, useEffect, useContext } from 'react';
```

Should NOT have "network" before "import"!



