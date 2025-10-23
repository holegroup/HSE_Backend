@echo off
echo ========================================
echo Restarting HSE Backend Server
echo ========================================
echo.

echo Stopping any running Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
echo.
node index.js

pause
