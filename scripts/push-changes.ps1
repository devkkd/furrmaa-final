# Safe push: stages REAL project folders (not backup/zips/submodule pointers), commits, pushes.
#
# Usage:
#   cd G:\KKDfurma
#   powershell -ExecutionPolicy Bypass -File .\scripts\push-changes.ps1 -Message "wallet hidden on web and app"
#
# First-time only (if GitHub still shows arrow folders):
#   powershell -ExecutionPolicy Bypass -File .\scripts\fix_submodules_into_normal_folders.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\push-changes.ps1 -Message "fix: normal folders for backend web app"

param(
  [Parameter(Mandatory = $false)]
  [string]$Message = 'update',

  [switch]$SkipPush,

  [switch]$ForcePush
)

$ErrorActionPreference = 'Stop'

$repoRoot =
  if ($PSScriptRoot) { (Resolve-Path (Join-Path $PSScriptRoot '..')).Path } else { (Get-Location).Path }

Set-Location $repoRoot
if (-not (git rev-parse --show-toplevel 2>$null)) {
  Write-Host 'ERROR: Not a git repository. Run from G:\KKDfurma' -ForegroundColor Red
  exit 1
}

$ensureScript = Join-Path $PSScriptRoot 'ensure-normal-folders.ps1'
if (-not (Test-Path $ensureScript)) {
  Write-Host "Missing: $ensureScript" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== Step 1: Ensure backend / web / app are normal folders ===" -ForegroundColor Cyan
& powershell -ExecutionPolicy Bypass -File $ensureScript
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== Step 2: Stage changes (only project paths) ===" -ForegroundColor Cyan
$paths = @(
  'farmaa2-backend',
  'furrmaa-web-frontend',
  'Farmaa',
  'scripts',
  '.gitignore',
  'GIT_MONOREPO_PUSH.md',
  'PUSH.md'
)
foreach ($p in $paths) {
  if (Test-Path (Join-Path $repoRoot $p)) {
    git add --force -- $p 2>$null | Out-Null
  }
}

$status = git status --short
if (-not $status) {
  Write-Host 'Nothing to commit — working tree clean.' -ForegroundColor Yellow
  if (-not $SkipPush) {
    Write-Host 'Pushing anyway (remote may already be up to date)...' -ForegroundColor DarkGray
    git push origin main
  }
  exit 0
}

Write-Host $status

# Block bad commits (gitlink only)
$bad = @()
foreach ($name in @('farmaa2-backend', 'furrmaa-web-frontend', 'Farmaa')) {
  $line = git diff --cached --name-only 2>$null
  $mode = git ls-files -s -- $name 2>$null | Select-Object -First 1
  if ($mode -match '^160000\s') { $bad += $name }
}
if ($bad.Count -gt 0) {
  Write-Host "`nBLOCKED: Still submodule/gitlink: $($bad -join ', ')" -ForegroundColor Red
  Write-Host 'Run once: powershell -File .\scripts\fix_submodules_into_normal_folders.ps1' -ForegroundColor Yellow
  exit 1
}

Write-Host "`n=== Step 3: Commit ===" -ForegroundColor Cyan
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Commit failed (maybe no changes?).' -ForegroundColor Red
  exit $LASTEXITCODE
}

if ($SkipPush) {
  Write-Host 'SkipPush set — commit done, not pushing.' -ForegroundColor Green
  exit 0
}

Write-Host "`n=== Step 4: Push to GitHub ===" -ForegroundColor Cyan
if ($ForcePush) {
  git push origin main --force
} else {
  git push origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Retry with -ForcePush if remote history conflicts.' -ForegroundColor Yellow
    exit $LASTEXITCODE
  }
}

Write-Host "`nDone. Check: https://github.com/devkkd/furrmaa-final" -ForegroundColor Green
Write-Host 'Open farmaa2-backend / furrmaa-web-frontend — files should expand (no arrow-only folder).' -ForegroundColor Green
