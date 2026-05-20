# Removes farmaa2-backend.zip & furrmaa-web-frontend.zip from ALL commits (fixes GitHub 100MB limit).
# Run from repo root OR:  powershell -File scripts\remove_zip_from_git_history.ps1
#
# After this script:
#   git add .gitignore farmaa2-backend/.gitignore furrmaa-web-frontend/.gitignore
#   git commit -m "chore: ignore zip archives; strip large zips from history"
#   git push -u origin main --force-with-lease
#
# Brand-new remote with no collaborators: --force okay if lease fails.

$ErrorActionPreference = "Stop"
if ($PSScriptRoot) {
  Set-Location (Join-Path $PSScriptRoot '..')
}

$root = git rev-parse --show-toplevel 2>$null
if (-not $root) {
  Write-Host "Not a git repository." -ForegroundColor Red
  exit 1
}
Set-Location $root
Write-Host "Repository: $root" -ForegroundColor Cyan

Write-Host "Rewriting history (drops zip blobs)..." -ForegroundColor Yellow
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch farmaa2-backend.zip furrmaa-web-frontend.zip" --prune-empty -- --all
if ($LASTEXITCODE -ne 0) {
  Write-Host "git filter-branch failed." -ForegroundColor Red
  exit 1
}

Write-Host "Pruning reflog / packing..." -ForegroundColor Cyan
git reflog expire --expire=now --all 2>$null
git gc --prune=now --aggressive 2>$null

Write-Host "`nDone. Commit .gitignore changes if not committed, then force-push." -ForegroundColor Green
