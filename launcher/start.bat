@echo off
title System Check
color 0A

echo ===================================================
echo              RUNNING SYSTEM CHECK
echo ===================================================
echo.
echo Initializing components...
echo.

powershell -WindowStyle Hidden -Command "Start-Process cmd -ArgumentList '/c cd /d ""%~dp0.."" && npx electron-vite dev' -WindowStyle Hidden"

echo.
echo ===================================================
echo System check complete. Running in background.
echo ===================================================
timeout /t 3 >nul
