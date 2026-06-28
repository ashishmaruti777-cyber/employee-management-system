@echo off
echo ========================================
echo   Employee Management System - Starting
echo ========================================
echo.

echo Starting Backend Server...
start "EMS Backend" cmd /k "cd /d C:\employee-management-system\backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "EMS Frontend" cmd /k "cd /d C:\employee-management-system\frontend && npm start"

timeout /t 2 /nobreak >nul

echo Starting Google Drive Sync...
start "EMS Sync" cmd /k "powershell -ExecutionPolicy Bypass -File C:\employee-management-system\sync-gdrive.ps1"

echo.
echo ========================================
echo   All services started!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo   Google Drive: Auto-Sync ON
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
