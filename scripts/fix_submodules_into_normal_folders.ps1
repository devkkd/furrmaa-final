# Converts farmaa2-backend + furrmaa-web-frontend from Git submodules/gitlinks into normal folders,
# so GitHub shows all source files inside the parent repo.
#
# Run (PowerShell, from repo root):
#   cd G:\KKDfurma
#   powershell -ExecutionPolicy Bypass -File .\scripts\fix_submodules_into_normal_folders.ps1
#
# Then commit + push (history may rewrite if you combine with ZIP cleanup — that's separate):
#   git add farmaa2-backend furrmaa-web-frontend .gitmodules
#   git status
#   git commit -m "fix: track backend and web as normal folders (not submodules)"
#   git push origin main --force-with-lease
#
$ErrorActionPreference = "Continue"
Set-StrictMode -Version Latest

function Test-SubmoduleEntry {
  param([string]$Path)
  git ls-files -s -- $Path 2>$null | ForEach-Object {
    if ($_ -match '^160000\s') { return $true }
  }
  return $false
}

$repoRoot =
  if ($PSScriptRoot) { (Resolve-Path (Join-Path $PSScriptRoot '..')).Path } else { (Get-Location).Path }

Set-Location $repoRoot
if (-not (git rev-parse --show-toplevel 2>$null)) {
  Write-Host "ERROR: Not a git repository: $repoRoot" -ForegroundColor Red
  exit 1
}

$folders = @('farmaa2-backend', 'furrmaa-web-frontend')
Write-Host "`nRepo: $(git rev-parse --show-toplevel)" -ForegroundColor Cyan

# --- Light backup (no node_modules/.next inside backup to save space) ---
$bak = Join-Path $repoRoot ("_bak_submodule_fix_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
New-Item -ItemType Directory -Path $bak -Force | Out-Null
foreach ($name in $folders) {
  $src = Join-Path $repoRoot $name
  if (-not (Test-Path $src)) {
    Write-Host "WARN: Folder missing (skip backup): $name" -ForegroundColor Yellow
    continue
  }
  $dst = Join-Path $bak $name
  Write-Host "Backup (excluding heavy dirs): $name -> $dst"
  robocopy $src $dst /E /XD node_modules .next .turbo .git uploads /XF *.log | Out-Null
}
Write-Host "Backup base: $bak" -ForegroundColor Green

foreach ($name in $folders) {
  $path = Join-Path $repoRoot $name
  if (-not (Test-Path $path)) {
    Write-Host "WARN: Skip (folder missing): $name" -ForegroundColor Yellow
    continue
  }

  $mode160 = Test-SubmoduleEntry -Path $name
  Write-Host "`nProcessing: $name (gitlink submodule in index: $mode160)"

  if ($mode160) {
    Push-Location $repoRoot
    try {
      git submodule deinit -f $name 2>$null | Out-Null
      git rm -f $name 2>$null | Out-Null
    } finally {
      Pop-Location
    }

    $restoreFrom = Join-Path $bak $name
    if (Test-Path $restoreFrom) {
      if (Test-Path $path) {
        Remove-Item -Recurse -Force $path
      }
      Copy-Item -Recurse $restoreFrom $path
      Write-Host "  Restored $name from backup (after submodule removal)"
    }
  }

  $innerGit = Join-Path $path ".git"
  if (Test-Path $innerGit) {
    Remove-Item -Force -Recurse $innerGit
    Write-Host "  Removed nested: $innerGit"
  }

  if (-not $mode160) {
    Write-Host '  Not a gitlink in index - only cleaned nested .git if any.' -ForegroundColor DarkGray
  }
}

# Remove .gitmodules if present / stale
Push-Location $repoRoot
try {
  if (Test-Path ".gitmodules") {
    git rm --cached .gitmodules 2>$null | Out-Null
    Remove-Item -Force .gitmodules -ErrorAction SilentlyContinue
    Write-Host "`nRemoved .gitmodules"
  }

  git config -f ".git/config" --remove-section "submodule" 2>$null | Out-Null

  # Clean module dirs under parent .git
  foreach ($name in $folders) {
    $mod = Join-Path $repoRoot (Join-Path ".git" (Join-Path "modules" $name))
    if (Test-Path $mod) {
      Remove-Item -Recurse -Force $mod -ErrorAction SilentlyContinue
    }
  }
} finally {
  Pop-Location
}

Push-Location $repoRoot
try {
  foreach ($name in $folders) {
    if (Test-Path (Join-Path $repoRoot $name)) {
      git add --force $name
      Write-Host "Staged for commit: $name"
    }
  }
} finally {
  Pop-Location
}

Write-Host ''
Write-Host 'DONE. Review with:  git status' -ForegroundColor Green
Write-Host 'If node_modules was skipped in backup: npm install in backend + web folders.' -ForegroundColor DarkYellow
Write-Host 'Then commit + push (use force-with-lease if remote still has old submodule pointers):' -ForegroundColor Yellow
$commitMsg = 'fix: include backend/web as normal repo folders (not submodules)'
Write-Host ('  git commit -m "{0}"' -f $commitMsg)
Write-Host '  git push origin main --force-with-lease'
Write-Host ''
Write-Host ('Backup kept at (delete after verifying): ' + $bak)
