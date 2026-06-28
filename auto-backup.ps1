$backupDir = "C:\employee-management-system\backups"
$logFile = "C:\employee-management-system\logs\auto-backup.log"

if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
if (-not (Test-Path "C:\employee-management-system\logs")) { New-Item -ItemType Directory -Path "C:\employee-management-system\logs" -Force | Out-Null }

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

$backups = Get-ChildItem -Path $backupDir -Filter "*.json" | Sort-Object CreationTime -Descending
if ($backups.Count -gt 30) {
    $toDelete = $backups | Select-Object -Skip 30
    foreach ($file in $toDelete) {
        Remove-Item $file.FullName -Force
        Write-Log "Old backup deleted: $($file.Name)"
    }
    Write-Log "Cleaned up $($toDelete.Count) old backups (kept 30)"
}

Write-Log "=== Daily Auto Backup Completed ==="
