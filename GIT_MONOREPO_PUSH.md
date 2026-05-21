# Monorepo push — submodule / ZIP issues

## Daily push (after any code change)

```powershell
cd G:\KKDfurma
powershell -ExecutionPolicy Bypass -File .\scripts\push-changes.ps1 -Message "your message"
```

See **`PUSH.md`** for full workflow. Do **not** use `git add .`.

---

## GitHub shows arrow icon on `farmaa2-backend` / `furrmaa-web-frontend` / `Farmaa` — folder empty?

Those entries are **submodules / gitlinks** (nested `.git` inside each folder). GitHub stores only a **pointer**, not your source files. Your PC has the real code; remote does not.

### Fix — run once from `G:\KKDfurma` (PowerShell)

```powershell
cd G:\KKDfurma
powershell -ExecutionPolicy Bypass -File .\scripts\fix_submodules_into_normal_folders.ps1
git status
```

You should see **thousands of files** staged under `farmaa2-backend/`, `furrmaa-web-frontend/`, and `Farmaa/` (not just 1 line per folder).

```powershell
git commit -m "fix: track backend, web, and app as normal folders (not submodules)"
git push origin main --force-with-lease
```

If push is rejected, retry once with:

```powershell
git push origin main --force
```

(Only if you are sure no one else needs the old broken history on `main`.)

### After push — check on GitHub

- Open `farmaa2-backend` → you should see `server.js`, `package.json`, `routes/`, etc. (no arrow-only empty folder).
- Same for `furrmaa-web-frontend` and `Farmaa`.

### Do not commit by mistake

- **`_bak_submodule_fix_*`** — backup only (already in `.gitignore`).
- **`*.zip`** — never commit (GitHub 100MB limit).

Script creates **`_bak_submodule_fix_*`** without `node_modules` / `.next`. After verifying GitHub, delete that backup folder locally. Then:

```powershell
cd G:\KKDfurma\farmaa2-backend; npm install
cd G:\KKDfurma\furrmaa-web-frontend; npm install
cd G:\KKDfurma\Farmaa\Farmaa; npm install
```

---

## ZIP files caused “file exceeds 100 MB”?

```powershell
cd G:\KKDfurma
powershell -ExecutionPolicy Bypass -File .\scripts\remove_zip_from_git_history.ps1
# then commit + force-push per script instructions
```

Root `.gitignore` already ignores `*.zip`; do **not** commit archives.

---

## After fix

Refresh GitHub repo — folders should expand with full source trees.
