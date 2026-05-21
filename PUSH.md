# Push changes to GitHub (Furrmaa monorepo)

Work only in **`G:\KKDfurma`**. Do **not** use `git add .` — it can re-add backup folders or submodule pointers.

## Every time you change code (web / backend / app)

```powershell
cd G:\KKDfurma
powershell -ExecutionPolicy Bypass -File .\scripts\push-changes.ps1 -Message "describe your change"
```

Example:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\push-changes.ps1 -Message "hide wallet on web and app"
```

This script will:

1. Remove nested `.git` inside `farmaa2-backend`, `furrmaa-web-frontend`, `Farmaa` (if any)
2. Fix gitlink/submodule entries so **real files** are tracked
3. Stage only project folders (not `_bak_*`, not `.zip`)
4. Commit + `git push origin main`

## First time / GitHub still shows arrow folders (empty on click)

Run the one-time fix, then push:

```powershell
cd G:\KKDfurma
powershell -ExecutionPolicy Bypass -File .\scripts\fix_submodules_into_normal_folders.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\push-changes.ps1 -Message "fix: backend web app as normal folders"
```

If push fails with history conflict:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\push-changes.ps1 -Message "fix: normal folders" -ForcePush
```

## Rules (important)

| Do | Don't |
|----|--------|
| Edit files in `farmaa2-backend`, `furrmaa-web-frontend`, `Farmaa` | Commit `_bak_submodule_fix_*` |
| Use `push-changes.ps1` | `git add .` |
| Keep `.env` local only (gitignored) | Commit `*.zip` archives |

## Verify on GitHub

After push, open:

- `farmaa2-backend` → `server.js`, `routes/`, `package.json`
- `furrmaa-web-frontend` → `src/`, `package.json`

If you only see a folder icon with an arrow and no files inside, run **fix_submodules** again, then **push-changes**.
