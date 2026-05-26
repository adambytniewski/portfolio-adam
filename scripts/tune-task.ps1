# Dostraja istniejące zadanie — dodaje StartWhenAvailable (run-after-missed)
# i retry przy błędach.

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5)

Set-ScheduledTask -TaskName 'Portfolio Daily Now Update' -Settings $settings | Select-Object TaskName, State
