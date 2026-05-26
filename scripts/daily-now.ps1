# Daily Now-feed launcher — wywoływany przez Task Scheduler o 18:00.
# Przekierowuje stdout/stderr do scripts/daily-now.log z timestampem.

$ErrorActionPreference = 'Continue'
$projectRoot = 'C:\Users\adamb\OneDrive\Desktop\portfolio-adam'
$logFile = Join-Path $projectRoot 'scripts\daily-now.log'
$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

Add-Content -Path $logFile -Value "`n========== $ts START =========="

Set-Location $projectRoot

# Upewnij się że node jest w PATH (dla Task Scheduler — czasem ma minimalne env)
$env:PATH = "$env:PATH;C:\Program Files\nodejs;$env:USERPROFILE\AppData\Roaming\npm"

try {
    $out = & node 'scripts\daily-now.mjs' 2>&1
    $exit = $LASTEXITCODE
    Add-Content -Path $logFile -Value $out
    Add-Content -Path $logFile -Value "========== END (exit=$exit) =========="
    exit $exit
} catch {
    Add-Content -Path $logFile -Value "PS1 EXCEPTION: $_"
    Add-Content -Path $logFile -Value "========== END (exception) =========="
    exit 99
}
