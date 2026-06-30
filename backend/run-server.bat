@echo off
set PATH=%PATH%;C:\Program Files\nodejs
cd /d "G:\Other computers\My PC\employee-management-system\backend"
echo Starting server...
node src/server.js > "G:\Other computers\My PC\employee-management-system\logs\server-output.log" 2>&1
echo Server exited with code %ERRORLEVEL%
pause
