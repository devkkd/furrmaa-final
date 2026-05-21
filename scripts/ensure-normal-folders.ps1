# Keeps farmaa2-backend, furrmaa-web-frontend, Farmaa as NORMAL folders (not gitlinks).
# Run before every commit/push — or use scripts/push-changes.ps1 which calls this automatically.
#
#   powershell -ExecutionPolicy Bypass -File .\scripts\ensure-normal-folders.ps1

$ErrorActionPreference = 'Continue'
Set-StrictMode -Version Latest

function Test-GitlinkInIndex {
  param([string]$Path)
  $line = git ls-files -s -- $Path 2>$null | Select-Object -First 1
  return ($line -match '^160000\s')
}

$repoRoot =
  if ($PSScriptRoot) { (Resolve-Path (Join-Path $PSScriptRoot '..')).Path } else { (Get-Location).Path }

Set-Location $repoRoot
if (-not (git rev-parse --show-toplevel 2>$null)) {
  Write-Host 'ERROR: Not a git repo. cd G:\KKDfurma first.' -ForegroundColor Red
  exit 1
}

$folders = @('farmaa2-backend', 'furrmaa-web-frontend', 'Farmaa')
Write-Host "Repo: $(git rev-parse --show-toplevel)" -ForegroundColor Cyan

# Stop tracking backup copies if they were committed by mistake
Get-ChildItem -Directory -Filter '_bak_submodule_fix_*' -ErrorAction SilentlyContinue | ForEach-Object {
  if (git ls-files -- $_.Name 2>$null) {
    Write-Host "Untrack backup: $($_.Name)" -ForegroundColor Yellow
    git rm -r --cached -- $_.Name 2>$null | Out-Null
  }
}

# Never track zips
Get-ChildItem -File -Filter '*.zip' -ErrorAction SilentlyContinue | ForEach-Object {
  if (git ls-files -- $_.Name 2>$null) {
    Write-Host "Untrack zip: $($_.Name)" -ForegroundColor Yellow
    git rm --cached -- $_.Name 2>$null | Out-Null
  }
}

foreach ($name in $folders) {
  $path = Join-Path $repoRoot $name
  if (-not (Test-Path $path)) {
    Write-Host "WARN: missing folder $name" -ForegroundColor Yellow
    continue
  }

  foreach ($gitDir in @(
      (Join-Path $path '.git'),
      (Join-Path $path 'Farmaa\.git')
    )) {
    if (Test-Path $gitDir) {
      Remove-Item -Force -Recurse $gitDir
      Write-Host "Removed nested .git: $gitDir" -ForegroundColor Green
    }
  }

  if (Test-GitlinkInIndex -Path $name) {
    Write-Host "Fix gitlink -> normal files: $name" -ForegroundColor Yellow
    git submodule deinit -f $name 2>$null | Out-Null
    git rm -f --cached $name 2>$null | Out-Null
  }

  git add --force $name
  $count = (git ls-files -- $name 2>$null | Measure-Object).Count
  Write-Host "  $name : $count tracked file(s)" -ForegroundColor $(if ($count -gt 5) { 'Green' } else { 'Red' })
  if ($count -le 1) {
    Write-Host "  ^ Too few files! Folder may still be a submodule. Run fix_submodules_into_normal_folders.ps1 once." -ForegroundColor Red
  }
}

if (Test-Path '.gitmodules') {
  git rm --cached .gitmodules 2>$null | Out-Null
  Remove-Item -Force .gitmodules -ErrorAction SilentlyContinue
  Write-Host 'Removed .gitmodules' -ForegroundColor Green
}

git add --force scripts .gitignore GIT_MONOREPO_PUSH.md PUSH.md 2>$null | Out-Null

Write-Host ''
Write-Host 'Ready to commit. Next:' -ForegroundColor Green
Write-Host '  powershell -File .\scripts\push-changes.ps1 -Message "your message"'
