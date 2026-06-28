$ErrorActionPreference = "SilentlyContinue"

$source = "C:\employee-management-system"
$dest = "$env:USERPROFILE\Google Drive\My Drive\EMS-Project"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EMS Auto-Sync to Google Drive" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Source: $source" -ForegroundColor Yellow
Write-Host "Destination: $dest" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Write-Host "Created destination folder" -ForegroundColor Green
}

function Sync-Files {
    $folders = @("backend\src", "frontend\src", "frontend\public")
    $files = @("backend\package.json", "backend\.env", "frontend\package.json", "start-servers.bat", "README.md")
    
    foreach ($folder in $folders) {
        $srcPath = Join-Path $source $folder
        $dstPath = Join-Path $dest $folder
        if (Test-Path $srcPath) {
            if (-not (Test-Path $dstPath)) {
                New-Item -ItemType Directory -Path $dstPath -Force | Out-Null
            }
            Copy-Item -Path "$srcPath\*" -Destination $dstPath -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    foreach ($file in $files) {
        $srcFile = Join-Path $source $file
        if (Test-Path $srcFile) {
            $dstFile = Join-Path $dest $file
            $dstDir = Split-Path $dstFile -Parent
            if (-not (Test-Path $dstDir)) {
                New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
            }
            Copy-Item -Path $srcFile -Destination $dstFile -Force
        }
    }
}

Write-Host "Starting initial sync..." -ForegroundColor Green
Sync-Files
Write-Host "Initial sync complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Watching for changes... (Press Ctrl+C to stop)" -ForegroundColor Cyan
Write-Host ""

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $source
$watcher.IncludeSubdirectories = $true
$watcher.Filter = "*.js,*.css,*.json,*.env,*.bat"
$watcher.EnableRaisingEvents = $true

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    $relativePath = $path.Replace("C:\employee-management-system\", "")
    
    if ($relativePath -notlike "node_modules*" -and $relativePath -notlike "backups*") {
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] Change detected: $changeType - $relativePath" -ForegroundColor Yellow
        
        Start-Sleep -Seconds 2
        Sync-Files
        Write-Host "[$timestamp] Synced to Google Drive" -ForegroundColor Green
    }
}

Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action
Register-ObjectEvent $watcher "Renamed" -Action $action

try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $watcher.Dispose()
    Write-Host "Sync stopped." -ForegroundColor Red
}
