@echo off
title EMS Server Manager - Auto Restart
color 0A

echo ========================================
echo   EMS Server Manager
echo   Auto-restart on crash
echo ========================================
echo.

:backend_loop
echo [%time%] Starting Backend Server...
cd /d C:\employee-management-system\backend
node src/server.js
echo [%time%] Backend crashed! Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto backend_loop
