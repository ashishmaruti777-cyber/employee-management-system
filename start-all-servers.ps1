# Employee Management System - One Click Start
# This script starts all servers and shows online status

# Function to check if a process is running
function Check-Process {
    param([string]$name)
    return (Get-Process -Name $name -ErrorAction SilentlyContinue) -ne $null
}

# Function to show status
function Show-Status {
    param([string]$service, [bool]$isRunning)
    $status = if ($isRunning) {"ONLINE 🟢"} else {"OFFLINE 🔴"}
    Write-Host "$service Status: $status"
}

# Clear screen
Clear-Host
Write-Host "==========================================="
Write-Host "  Employee Management System - Server Control"
Write-Host "==========================================="
Write-Host "Starting all servers... Please wait...
"

# 1. Start MongoDB (if using local MongoDB)
$mongoRunning = Check-Process "mongod"
if (-not $mongoRunning) {
    Write-Host "Starting MongoDB..."
    Start-Process "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" -WindowStyle Hidden
    Start-Sleep -Seconds 5
    $mongoRunning = Check-Process "mongod"
}
Show-Status -service "MongoDB" -isRunning $mongoRunning

# 2. Start Backend Server
$backendRunning = Check-Process "node"
if (-not $backendRunning) {
    Write-Host "Starting Backend Server..."
    Set-Location "G:\Other computers\My PC\employee-management-system\backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 10
    $backendRunning = Check-Process "node"
}
Show-Status -service "Backend Server" -isRunning $backendRunning

# 3. Start Frontend Server
$frontendRunning = Check-Process "node" -and (Get-Process node | Where-Object { $_.Path -like "*frontend*" })
if (-not $frontendRunning) {
    Write-Host "Starting Frontend Server..."
    Set-Location "G:\Other computers\My PC\employee-management-system\frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Start-Sleep -Seconds 15
    $frontendRunning = Check-Process "node" -and (Get-Process node | Where-Object { $_.Path -like "*frontend*" })
}
Show-Status -service "Frontend Server" -isRunning $frontendRunning

# 4. Start Cloudflare Tunnel (if needed)
$cloudflareRunning = Check-Process "cloudflared"
if (-not $cloudflareRunning) {
    Write-Host "Starting Cloudflare Tunnel..."
    Set-Location "G:\Other computers\My PC\employee-management-system"
    Start-Process "cloudflared.exe" -ArgumentList "tunnel --url http://localhost:3000" -WindowStyle Hidden
    Start-Sleep -Seconds 5
    $cloudflareRunning = Check-Process "cloudflared"
}
Show-Status -service "Cloudflare Tunnel" -isRunning $cloudflareRunning

# Final Status
Write-Host "
==========================================="
$(
    if ($mongoRunning -and $backendRunning -and $frontendRunning) {
        "🟢 ALL SERVERS ARE ONLINE!"
        "Access your system at: http://localhost:3000"
        if ($cloudflareRunning) {
            "Public URL: https://your-subdomain.trycloudflare.com"
        }
    } else {
        "🔴 SOME SERVERS FAILED TO START!"
        "Please check the console windows."
    }
)
Write-Host "==========================================="

# Keep window open
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")