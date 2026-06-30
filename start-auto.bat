@echo off
echo ==========================================
echo   EMS - AUTO UPDATE MODE
echo ==========================================
echo.
echo Jab bhi code change karoge, website 
echo automatic update ho jayegi!
echo.
echo Link: https://plural-majorette-aftermath.ngrok-free.dev
echo.
echo BAND KARNE KE LIYE: Ctrl+C dabao
echo ==========================================
echo.

cd /d C:\employee-management-system

echo [1/3] Backend Chalu Ho Raha Hai (port 5000)...
start "BACKEND" powershell -NoExit -Command "cd C:\employee-management-system\backend; npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Frontend Chalu Ho Raha Hai (port 3000)...
start "FRONTEND" powershell -NoExit -Command "cd C:\employee-management-system\frontend; set REACT_APP_API_URL=/api && npm start"
timeout /t 5 /nobreak >nul

echo [3/3] Ngrok Chalu Ho Raha Hai...
start "NGROK" powershell -NoExit -Command "C:\employee-management-system\ngrok.exe http 3000"
timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   SAB KUCH CHALU HAI - AUTO UPDATE ON!
echo ==========================================
echo.
echo Link: https://plural-majorette-aftermath.ngrok-free.dev
echo.
echo 4 WINDOWS MINIMIZE KARO (BAND MAT KARNA)
echo.
pause
