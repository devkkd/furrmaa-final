# Monorepo push — submodule / ZIP issues

## GitHub shows `farmaa2-backend` / `furrmaa-web-frontend` arrow icon, folder empty?

Those entries are **submodules / gitlinks** (nested `.git` under each folder while parent also tracks them). GitHub only stores a pointer, **not your files**.

### Fix — run once from `G:\KKDfurma`

```powershell
cd G:\KKDfurma
powershell -ExecutionPolicy Bypass -File .\scripts\fix_submodules_into_normal_folders.ps1
git status
git commit -m "fix: track backend/web as normal folders (not submodules)"
git push origin main --force-with-lease
```

Use `git push origin main --force` only if lease fails and you accept overwriting remote history.

Script creates a **`_bak_submodule_fix_*`** folder (without `node_modules` / `.next`) — verify push, then delete backup. After restore, run:

```powershell
cd G:\KKDfurma\farmaa2-backend; npm install
cd G:\KKDfurma\furrmaa-web-frontend; npm install
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
