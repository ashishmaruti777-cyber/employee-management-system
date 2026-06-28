@echo off
title EMS - Employee Management System
color 0A

echo ============================================
echo    Employee Management System
echo    Starting All Services...
echo ============================================
echo.

:: Kill old processes
echo [1/6] Stopping old processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM mongod.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
echo       Done.
echo.

:: Create logs folder
if not exist "C:\employee-management-system\logs" mkdir "C:\employee-management-system\logs"
if not exist "C:\data\db" mkdir "C:\data\db"

:: Start MongoDB
echo [2/6] Starting MongoDB (Port 27017)...
start "EMS-MongoDB" /MIN cmd /c "C:\MongoDB\mongodb-win32-x86_64-windows-7.0.9\bin\mongod.exe --dbpath C:\data\db"
timeout /t 5 /nobreak >nul
netstat -ano | findstr ":27017" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo       MongoDB: RUNNING
) else (
    echo       MongoDB: Starting...
)
echo.

:: Start Backend
echo [3/6] Starting Backend (Port 5000)...
start "EMS-Backend" /MIN cmd /c "cd /d C:\employee-management-system\backend && node src/server.js > C:\employee-management-system\logs\backend.log 2>&1"
timeout /t 5 /nobreak >nul
echo       Backend: RUNNING
echo.

:: Start Frontend
echo [4/6] Starting Frontend (Port 3000)...
start "EMS-Frontend" /MIN cmd /c "cd /d C:\employee-management-system\frontend && set BROWSER=none && npx react-scripts start > C:\employee-management-system\logs\frontend.log 2>&1"
echo       Frontend: Starting (30-60 sec)
echo.

:: Start Google Drive Sync
echo [5/6] Starting Google Drive Sync...
start "EMS-GDrive-Sync" /MIN cmd /c "powershell -ExecutionPolicy Bypass -File C:\employee-management-system\sync-gdrive.ps1"
echo       Google Drive Sync: ON
echo.

:: Start GitHub Auto-Sync
echo [6/6] Starting GitHub Auto-Sync...
start "EMS-GitHub-Sync" /MIN cmd /c "powershell -ExecutionPolicy Bypass -File C:\employee-management-system\auto-sync-github.ps1"
echo       GitHub Auto-Sync: ON
echo.

echo ============================================
echo    All services started!
echo.
echo    MongoDB:    http://localhost:27017
echo    Backend:    http://localhost:5000
echo    Frontend:   http://localhost:3000
echo    Google Drive: Auto-Sync ON
echo    GitHub:      Auto-Sync ON
echo.
echo    Login: admin@company.com / password123
echo ============================================
echo.
echo Press Ctrl+C to stop. Checking every 30 seconds...
echo.

:health_loop
timeout /t 30 /nobreak >nul

netstat -ano | findstr ":27017" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [%time%] MongoDB DOWN! Restarting...
    start "EMS-MongoDB" /MIN cmd /c "C:\MongoDB\mongodb-win32-x86_64-windows-7.0.9\bin\mongod.exe --dbpath C:\data\db"
    echo [%time%] MongoDB restarted!
    timeout /t 5 /nobreak >nul
)

netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [%time%] Backend DOWN! Restarting...
    start "EMS-Backend" /MIN cmd /c "cd /d C:\employee-management-system\backend && node src/server.js >> C:\employee-management-system\logs\backend.log 2>&1"
    echo [%time%] Backend restarted!
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [%time%] Frontend DOWN! Restarting...
    start "EMS-Frontend" /MIN cmd /c "cd /d C:\employee-management-system\frontend && set BROWSER=none && npx react-scripts start >> C:\employee-management-system\logs\frontend.log 2>&1"
    echo [%time%] Frontend restarted!
)

:: Check GitHub Auto-Sync
tasklist /FI "WINDOWTITLE eq EMS-GitHub-Sync" 2>nul | findstr "powershell" >nul
if errorlevel 1 (
    echo [%time%] GitHub Auto-Sync DOWN! Restarting...
    start "EMS-GitHub-Sync" /MIN cmd /c "powershell -ExecutionPolicy Bypass -File C:\employee-management-system\auto-sync-github.ps1"
    echo [%time%] GitHub Auto-Sync restarted!
)

goto health_loop
