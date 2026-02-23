# Free port 3001 so the backend can start.
# Run from repo root: .\version_1\lms_backend\scripts\free-port-3001.ps1
# Or from lms_backend: .\scripts\free-port-3001.ps1
$lines = netstat -ano | findstr ":3001.*LISTENING"
if (-not $lines) {
  Write-Host "Port 3001 is free."
  exit 0
}
$pids = @()
foreach ($line in $lines) {
  $parts = $line.Trim() -split '\s+'
  $p = $parts[-1]
  if ($p -match '^\d+$' -and $pids -notcontains $p) { $pids += $p }
}
foreach ($pid in $pids) {
  Write-Host "Stopping process $pid on port 3001..."
  taskkill /PID $pid /F 2>$null
}
Write-Host "Port 3001 should be free. Run: npm run dev"
