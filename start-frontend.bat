@echo off
title EMS Frontend Manager - Auto Restart
color 0B

echo ========================================
echo   EMS Frontend Manager
echo   Auto-restart on crash
echo ========================================
echo.

:frontend_loop
echo [%time%] Starting Frontend Server...
cd /d C:\employee-management-system\frontend
npx react-scripts start
echo [%time%] Frontend crashed! Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto frontend_loop
