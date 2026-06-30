@echo off
echo ==========================================
echo   EMS - Mobile Link Builder
echo ==========================================
echo.

echo [1/3] Frontend Build Ho Raha Hai...
cd /d C:\employee-management-system\frontend
set REACT_APP_API_URL=/api
call npm run build
if %errorlevel% neq 0 (
    echo BUILD FAILED! Errors check karo.
    pause
    exit /b 1
)
echo [OK] Frontend Build Ho Gaya!
echo.

echo [2/3] Backend Restart Ho Raha Hai...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
cd /d C:\employee-management-system\backend
start powershell -Command "cd C:\employee-management-system\backend; npm run dev"
echo [OK] Backend Chalu Ho Gaya!
echo.

echo [3/3] Ngrok Restart Ho Raha Hai...
taskkill /F /IM ngrok.exe >nul 2>&1
timeout /t 2 /nobreak >nul
start powershell -Command "C:\employee-management-system\ngrok.exe http 5000"
echo [OK] Ngrok Chalu Ho Gaya!
echo.

echo ==========================================
echo   SAB KUCH READY HAI!
echo ==========================================
echo.
echo Mobile Link: https://plural-majorette-aftermath.ngrok-free.dev
echo.
echo DONO POWERSHELL WINDOWS MINIMIZE KARO!
echo.
pause
