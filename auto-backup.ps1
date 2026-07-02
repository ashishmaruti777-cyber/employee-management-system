$projectDir = $PSScriptRoot
$backupDir = Join-Path $projectDir "backend\backups"
$logFile = Join-Path $projectDir "logs\auto-backup.log"

if (-not (Test-Path (Join-Path $projectDir "backend\backups"))) { New-Item -ItemType Directory -Path (Join-Path $projectDir "backend\backups") -Force | Out-Null }
if (-not (Test-Path (Join-Path $projectDir "logs"))) { New-Item -ItemType Directory -Path (Join-Path $projectDir "logs") -Force | Out-Null }

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logFile -Value "[$timestamp] $Message"
    Write-Host "[$timestamp] $Message"
}

Write-Log "=== Standalone Auto Backup Started ==="

try {
    $nodeExe = Get-Command node | Select-Object -ExpandProperty Source
    $scriptPath = Join-Path $projectDir "backend\standalone-backup.js"
    
    $output = & $nodeExe $scriptPath 2>&1
    foreach ($line in $output) {
        Write-Log "  $line"
    }
    
    Write-Log "Standalone backup completed successfully!"
} catch {
    Write-Log "Standalone backup error: $($_.Exception.Message)"
}

# Cleanup old backups (keep 30)
$allBackups = Get-ChildItem -Path $backupDir -Recurse -Filter "*.json" | Sort-Object CreationTime -Descending
if ($allBackups.Count -gt 30) {
    $toDelete = $allBackups | Select-Object -Skip 30
    foreach ($file in $toDelete) {
        Remove-Item $file.FullName -Force
        $parentDir = $file.Directory
        if (($parentDir.FullName -ne $backupDir) -and ($null -eq (Get-ChildItem $parentDir.FullName -Filter "*.json"))) {
            Remove-Item $parentDir.FullName -Force -ErrorAction SilentlyContinue
        }
        Write-Log "Old backup deleted: $($file.Name)"
    }
    Write-Log "Cleaned up $($toDelete.Count) old backups (kept 30)"
}

Write-Log "=== Standalone Auto Backup Completed ==="
