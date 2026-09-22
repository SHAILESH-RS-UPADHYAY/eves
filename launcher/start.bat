@echo off
title EVES Background Service
color 0A

echo ===================================================
echo              RUNNING EVES SYSTEM
echo ===================================================
echo.
echo Initializing components...
echo.

powershell -WindowStyle Hidden -Command "Start-Process cmd -ArgumentList '/c cd /d ""%~dp0.."" && node ""%~dp0runner.js""' -WindowStyle Hidden"

echo.
echo ===================================================
echo System initialized. Running in background.
echo ===================================================
timeout /t 3 >nul
