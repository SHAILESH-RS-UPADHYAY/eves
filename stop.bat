@echo off
title Cleanup
color 0C

echo ===================================================
echo              STOPPING BACKGROUND PROCESS
echo ===================================================
echo.
echo Cleaning up...
taskkill /F /IM electron.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM mshta.exe /T >nul 2>&1

echo.
echo ===================================================
echo Done.
echo ===================================================
timeout /t 2 >nul
