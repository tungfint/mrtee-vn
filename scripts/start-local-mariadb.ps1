$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $root ".mariadb-data"
$server = "C:\Program Files\MariaDB 12.2\bin\mariadbd.exe"
$config = Join-Path $dataDir "my.ini"

if (-not (Test-Path $server)) {
  throw "MariaDB server not found at $server"
}

if (-not (Test-Path $config)) {
  throw "MariaDB data directory is missing. Run the local setup/import step again."
}

$listener = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  Write-Host "MariaDB is already listening on port 3306."
  exit 0
}

Start-Process `
  -FilePath $server `
  -ArgumentList "--defaults-file=$config --datadir=$dataDir --port=3306" `
  -WorkingDirectory $root `
  -RedirectStandardOutput ".mariadb.out.log" `
  -RedirectStandardError ".mariadb.err.log" `
  -WindowStyle Hidden

Start-Sleep -Seconds 3
Get-NetTCPConnection -LocalPort 3306 -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess
