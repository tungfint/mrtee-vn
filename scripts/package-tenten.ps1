param(
  [string]$Output = "Web-MrTee-tenten.zip"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$tempRoot = Join-Path $root ".codex-artifacts"
$stage = Join-Path $tempRoot "tenten-package"
$outputPath = Join-Path $root $Output

Set-Location $root

function Step($message) {
  Write-Host "`n==> $message" -ForegroundColor Cyan
}

if (-not (Test-Path ".next")) {
  throw ".next was not found. Run npm run deploy:build before packaging."
}

if (Test-Path $stage) {
  Remove-Item $stage -Recurse -Force
}

New-Item -ItemType Directory -Path $stage | Out-Null

Step "Copying deploy files"

$files = @(
  ".env.example",
  "components.json",
  "eslint.config.mjs",
  "next-env.d.ts",
  "next.config.ts",
  "package-lock.json",
  "package.json",
  "postcss.config.mjs",
  "prisma.config.ts",
  "server.js",
  "tsconfig.json"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    Copy-Item $file (Join-Path $stage $file) -Force
  }
}

$dirs = @(".next", "prisma", "public", "src")
foreach ($dir in $dirs) {
  Copy-Item $dir (Join-Path $stage $dir) -Recurse -Force
}

$unneededPaths = @(
  ".next/cache",
  ".next/dev",
  ".next/diagnostics"
)

foreach ($relativePath in $unneededPaths) {
  $fullPath = Join-Path $stage $relativePath
  if (Test-Path $fullPath) {
    Remove-Item $fullPath -Recurse -Force
  }
}

if (Test-Path $outputPath) {
  Remove-Item $outputPath -Force
}

Step "Creating $Output"
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $outputPath -Force

Write-Host "`nCreated package: $outputPath" -ForegroundColor Green
Write-Host "Upload this zip to your cPanel Application Root, then extract it there." -ForegroundColor Green

$tarOutput = Join-Path $root "Web-MrTee-tenten.tar.gz"
if (Get-Command tar -ErrorAction SilentlyContinue) {
  if (Test-Path $tarOutput) {
    Remove-Item $tarOutput -Force
  }

  Step "Creating Web-MrTee-tenten.tar.gz"
  tar -czf $tarOutput -C $stage .
  Write-Host "Created package: $tarOutput" -ForegroundColor Green
}

$runtimeStage = Join-Path $tempRoot "tenten-runtime-package"
$runtimeTarOutput = Join-Path $root "Web-MrTee-tenten-runtime.tar.gz"

if (Get-Command tar -ErrorAction SilentlyContinue) {
  if (Test-Path $runtimeStage) {
    Remove-Item $runtimeStage -Recurse -Force
  }

  New-Item -ItemType Directory -Path $runtimeStage | Out-Null
  Step "Copying runtime-only deploy files"

  foreach ($file in $files) {
    if (Test-Path $file) {
      Copy-Item $file (Join-Path $runtimeStage $file) -Force
    }
  }

  foreach ($dir in @(".next", "prisma", "public", "scripts")) {
    Copy-Item $dir (Join-Path $runtimeStage $dir) -Recurse -Force
  }

  foreach ($relativePath in @(
    ".next/cache",
    ".next/dev",
    ".next/diagnostics",
    ".next/build",
    ".next/types"
  )) {
    $fullPath = Join-Path $runtimeStage $relativePath
    if (Test-Path $fullPath) {
      Remove-Item $fullPath -Recurse -Force
    }
  }

  $nextNodeModules = Join-Path $runtimeStage ".next/node_modules"
  $runtimePrisma = Join-Path $nextNodeModules "@prisma"
  $runtimeGeneratedPrisma = Join-Path $nextNodeModules ".prisma"

  if (Test-Path $nextNodeModules) {
    Get-ChildItem $nextNodeModules -Force | Where-Object {
      $_.Name -ne "@prisma" -and $_.Name -ne ".prisma"
    } | Remove-Item -Recurse -Force
  } else {
    New-Item -ItemType Directory -Path $nextNodeModules -Force | Out-Null
  }

  if (Test-Path $runtimePrisma) {
    Remove-Item $runtimePrisma -Recurse -Force
  }
  if (Test-Path ".next/node_modules/@prisma") {
    Copy-Item ".next/node_modules/@prisma" $runtimePrisma -Recurse -Force
  }

  if (Test-Path $runtimeGeneratedPrisma) {
    Remove-Item $runtimeGeneratedPrisma -Recurse -Force
  }
  if (Test-Path "node_modules/.prisma") {
    Copy-Item "node_modules/.prisma" $runtimeGeneratedPrisma -Recurse -Force
  }

  if (Test-Path $runtimeTarOutput) {
    Remove-Item $runtimeTarOutput -Force
  }

  Step "Creating Web-MrTee-tenten-runtime.tar.gz"
  tar -czf $runtimeTarOutput -C $runtimeStage .
  Write-Host "Created package: $runtimeTarOutput" -ForegroundColor Green
}
