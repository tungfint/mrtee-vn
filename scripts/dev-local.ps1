param(
  [switch]$SkipDb,
  [switch]$Seed,
  [switch]$Demo,
  [switch]$NoServer,
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Step($message) {
  Write-Host "`n==> $message" -ForegroundColor Cyan
}

function Require-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name was not found. $hint"
  }
}

Require-Command "node" "Install Node.js first."
Require-Command "npm" "Install npm first."

if (-not (Test-Path ".env")) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example. Update DATABASE_URL and NEXTAUTH_SECRET if needed." -ForegroundColor Yellow
  } else {
    throw ".env is missing and .env.example was not found."
  }
}

if (-not (Test-Path "node_modules")) {
  Step "Installing npm dependencies"
  npm install
}

if (-not $SkipDb) {
  Step "Starting local MariaDB if configured"
  try {
    npm run db:mysql:start
  } catch {
    Write-Host "Could not start bundled local MariaDB. If you use another MySQL/MariaDB server, this is OK." -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor DarkYellow
  }
}

Step "Generating Prisma client"
npm run prisma:generate

Step "Validating Prisma schema"
npm run prisma:validate

Step "Applying database migrations"
npm run prisma:deploy

if ($Seed) {
  Step "Seeding base data"
  npm run db:seed
}

if ($Demo) {
  Step "Loading demo content"
  npm run db:demo
}

if ($NoServer) {
  Step "Local setup finished"
  exit 0
}

$env:PORT = "$Port"
$env:NEXTAUTH_URL = "http://localhost:$Port"

Step "Starting Next.js dev server on http://localhost:$Port"
npm run dev -- --hostname 0.0.0.0 --port $Port
