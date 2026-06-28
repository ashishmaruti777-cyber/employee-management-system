@echo off
echo ============================================
echo    Building Frontend for Production...
echo ============================================
echo.

cd /d C:\employee-management-system\frontend

echo [1/3] Installing dependencies...
call npm install

echo [2/3] Building React app...
set REACT_APP_API_URL=https://ems-backend.onrender.com/api
call npm run build

echo [3/3] Build complete!
echo.
echo Build folder: C:\employee-management-system\frontend\build
echo ============================================
echo.
echo Next: Push to GitHub, Cloudflare Pages auto-deploys!
echo.
pause
