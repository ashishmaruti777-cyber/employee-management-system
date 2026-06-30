Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EMS - AUTO UPDATE MODE" -ForegroundColor Cyan
Write-Host "  (File change detect karke auto rebuild)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "C:\employee-management-system\frontend\src"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::LastWrite

$rebuildScript = {
    Write-Host ""
    Write-Host "[CHANGE DETECTED] Frontend rebuild ho raha hai..." -ForegroundColor Yellow
    Set-Location "C:\employee-management-system\frontend"
    $env:REACT_APP_API_URL = "/api"
    npm run build 2>&1 | Out-Null
    if ($?) {
        Write-Host "[OK] Frontend rebuild ho gaya!" -ForegroundColor Green
        Write-Host "[OK] Public link automatically update ho jayega!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    }
    Write-Host "Waiting for changes... (Ctrl+C to stop)" -ForegroundColor Cyan
}

$debounce = $null
Register-ObjectEvent $watcher "Changed" -Action {
    if ($debounce) { $debounce.Dispose(); $debounce = $null }
    $debounce = [System.Threading.Timer]::new({
        Invoke-Command -ScriptBlock $rebuildScript
    }, $null, 2000, ([System.Threading.Timeout]::Infinite))
}.GetNewClosure()

Write-Host "[1/3] Backend + Frontend Build Chal raha hai..." -ForegroundColor Cyan
Set-Location "C:\employee-management-system\frontend"
$env:REACT_APP_API_URL = "/api"
npm run build 2>&1 | Out-Null
if ($?) { Write-Host "[OK] Frontend build complete!" -ForegroundColor Green } else { Write-Host "[ERROR] Build failed!" -ForegroundColor Red }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\employee-management-system\backend; npx nodemon src/server.js"
Write-Host "[OK] Backend started!" -ForegroundColor Green

Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList "-NoExit", "-Command", "C:\employee-management-system\ngrok.exe http 5000"
Write-Host "[OK] Ngrok started!" -ForegroundColor Green

Start-Sleep -Seconds 4
try {
    $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels"
    $url = $tunnels.tunnels[0].public_url
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  PUBLIC LINK: $url" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Ngrok URL check karne mein problem. Wait karo." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "AB: Frontend src folder mein koi bhi change karo -> auto rebuild hoga!" -ForegroundColor Yellow
Write-Host "Backend files change -> nodemon auto restart karega!" -ForegroundColor Yellow
Write-Host ""
Write-Host "BAND KARNE KE LIYE: Ctrl+C in POWERSHELL" -ForegroundColor Red

while ($true) {
    Start-Sleep -Seconds 1
}
