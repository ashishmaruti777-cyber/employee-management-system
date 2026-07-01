$projectDir = $PSScriptRoot
$backupDir = Join-Path $projectDir "backend\backups"
$logFile = Join-Path $projectDir "logs\auto-backup.log"

if (-not (Test-Path $projectDir\backend\backups)) { New-Item -ItemType Directory -Path (Join-Path $projectDir "backend\backups") -Force | Out-Null }
if (-not (Test-Path $projectDir\logs)) { New-Item -ItemType Directory -Path (Join-Path $projectDir "logs") -Force | Out-Null }

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Add-Content -Path $logFile -Value $logMessage
    Write-Host $logMessage
}

Write-Log "=== Daily Auto Backup Started ==="

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/backup/cron-backup" -Method POST -ContentType "application/json" -TimeoutSec 120
    if ($response.success) {
        Write-Log "Backup created: $($response.data.name) | Docs: $($response.data.totalDocuments) | Size: $([math]::Round($response.data.size/1024, 2)) KB"
    } else {
        Write-Log "Backup failed: $($response.message)"
    }
} catch {
    Write-Log "Backup API error: $($_.Exception.Message)"
}

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

Write-Log "=== Daily Auto Backup Completed ==="
