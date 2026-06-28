@echo off
title EMS - Employee Management System
color 0A
mode con: cols=60 lines=35

echo ============================================
echo    Employee Management System
echo    All-in-One Server Manager
echo ============================================
echo.

:: Kill old processes
echo [1/4] Stopping old processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
echo       Done.
echo.

:: Create logs folder
if not exist "C:\employee-management-system\logs" mkdir "C:\employee-management-system\logs"

:: Start Backend
echo [2/4] Starting Backend (Port 5000)...
start "EMS-Backend" /MIN cmd /c "cd /d C:\employee-management-system\backend && node src/server.js > C:\employee-management-system\logs\backend.log 2>&1"
timeout /t 4 /nobreak >nul

:: Check backend
curl -s http://localhost:5000 >nul 2>&1
if %errorlevel%==0 (
    echo       Backend: RUNNING
) else (
    echo       Backend: Starting...
)
echo.

:: Start Frontend
echo [3/4] Starting Frontend (Port 3000)...
start "EMS-Frontend" /MIN cmd /c "cd /d C:\employee-management-system\frontend && set BROWSER=none && npx react-scripts start > C:\employee-management-system\logs\frontend.log 2>&1"
echo       Frontend: Starting (takes 30-60 seconds)
echo.

:: Start Google Drive Sync
echo [4/4] Starting Google Drive Sync...
start "EMS-GDrive-Sync" /MIN cmd /c "powershell -ExecutionPolicy Bypass -File C:\employee-management-system\sync-gdrive.ps1"
echo       Google Drive Sync: RUNNING
echo.

echo ============================================
echo    All services started!
echo.
echo    Backend:   http://localhost:5000
echo    Frontend:  http://localhost:3000
echo    Google Drive: Auto-Sync ON
echo.
echo    Login: admin@company.com / password123
echo ============================================
echo.

:: Health check loop
echo Press Ctrl+C to stop all servers.
echo Keeping servers alive... (checking every 30 seconds)
echo.

:health_loop
timeout /t 30 /nobreak >nul

:: Check backend
tasklist /FI "WINDOWTITLE eq EMS-Backend" 2>nul | find /i "node" >nul
if errorlevel 1 (
    echo [%time%] Backend down! Restarting...
    start "EMS-Backend" /MIN cmd /c "cd /d C:\employee-management-system\backend && node src/server.js >> C:\employee-management-system\logs\backend.log 2>&1"
    echo [%time%] Backend restarted.
)

:: Check frontend
tasklist /FI "WINDOWTITLE eq EMS-Frontend" 2>nul | find /i "node" >nul
if errorlevel 1 (
    echo [%time%] Frontend down! Restarting...
    start "EMS-Frontend" /MIN cmd /c "cd /d C:\employee-management-system\frontend && set BROWSER=none && npx react-scripts start >> C:\employee-management-system\logs\frontend.log 2>&1"
    echo [%time%] Frontend restarted.
)

goto health_loop
