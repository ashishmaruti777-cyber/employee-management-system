$projectPath = $PSScriptRoot
$logFile = Join-Path $projectPath "github-sync.log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor Cyan
    Add-Content -Path $logFile -Value $logMessage
}

Set-Location $projectPath

Write-Log "=== GitHub Auto-Sync Started ==="
Write-Log "Watching: $projectPath"

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $projectPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$excludePatterns = @("node_modules", ".git", "backups", ".tmp.driveupload", "dist", "build", ".env")

function Should-Ignore {
    param([string]$path)
    foreach ($pattern in $excludePatterns) {
        if ($path -match $pattern) { return $true }
    }
    return $false
}

$pendingChanges = $false

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    if (-not (Should-Ignore $path)) {
        $script:pendingChanges = $true
    }
}

Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action
Register-ObjectEvent $watcher "Renamed" -Action $action

Write-Log "Waiting for changes..."

while ($true) {
    if ($pendingChanges) {
        Start-Sleep -Seconds 3
        $pendingChanges = $false

        Set-Location $projectPath

        $status = git status --porcelain 2>&1
        if ($status) {
            Write-Log "Changes detected! Committing..."

            git add -A 2>&1 | Out-Null

            $fileCount = (git status --porcelain | Measure-Object).Count
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $commitMsg = "Auto-sync: $fileCount file(s) updated at $timestamp"

            git commit -m $commitMsg 2>&1 | Out-Null

            $pushResult = git push 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Log "Pushed to GitHub successfully ($fileCount files)"
            } else {
                Write-Log "Push failed: $pushResult"
            }
        }
    }
    Start-Sleep -Seconds 2
}
