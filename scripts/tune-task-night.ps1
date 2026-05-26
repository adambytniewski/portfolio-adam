# Dostraja nocne zadanie — StartWhenAvailable + retry.

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5) `
    -WakeToRun

Set-ScheduledTask -TaskName 'Portfolio Daily Now Night Update' -Settings $settings | Select-Object TaskName, State
