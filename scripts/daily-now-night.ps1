# Daily Now-feed NIGHT launcher — Task Scheduler o 03:00 czasu polskiego.
# Patrzy na sesje z wczoraj po godzinie 18:00 (czyli to co po pierwszym auto-runie).
# Output do tego samego logu co dzienny.

$ErrorActionPreference = 'Continue'
$projectRoot = 'C:\Users\adamb\OneDrive\Desktop\portfolio-adam'
$logFile = Join-Path $projectRoot 'scripts\daily-now.log'
$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

Add-Content -Path $logFile -Value "`n========== $ts NIGHT START =========="

Set-Location $projectRoot

# Upewnij się że node + claude CLI są w PATH (Task Scheduler ma minimalne env)
$env:PATH = "$env:PATH;C:\Program Files\nodejs;$env:USERPROFILE\AppData\Roaming\npm;$env:USERPROFILE\AppData\Local\Microsoft\WinGet\Packages\Anthropic.ClaudeCode_Microsoft.Winget.Source_8wekyb3d8bbwe"

try {
    $out = & node 'scripts\daily-now.mjs' '--night' 2>&1
    $exit = $LASTEXITCODE
    Add-Content -Path $logFile -Value $out
    Add-Content -Path $logFile -Value "========== NIGHT END (exit=$exit) =========="
    exit $exit
} catch {
    Add-Content -Path $logFile -Value "PS1 EXCEPTION: $_"
    Add-Content -Path $logFile -Value "========== NIGHT END (exception) =========="
    exit 99
}
