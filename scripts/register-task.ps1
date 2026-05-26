# Jednorazowy rejestrator zadania w Task Scheduler.
# Uruchom raz, ręcznie, z normalnego usera (nie wymaga admina dla LogonType S4U).

$taskName = 'Portfolio Daily Now Update'
$scriptPath = 'C:\Users\adamb\OneDrive\Desktop\portfolio-adam\scripts\daily-now.ps1'

$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""

$trigger = New-ScheduledTaskTrigger -Daily -At '18:00'

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5)

$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType S4U `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'Codziennie 18:00 — wpis do now.json portfolio-adam (Ollama qwen3:8b z sesji Second Brain) + git push (Vercel autodeploy).' `
    -Force | Select-Object TaskName, State
