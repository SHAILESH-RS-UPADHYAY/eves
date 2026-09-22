@echo off
title EVES Cleanup
color 0C

echo ===================================================
echo              STOPPING EVES SYSTEM
echo ===================================================
echo.
echo Terminating running services...
taskkill /F /FI "WINDOWTITLE eq EVES*" /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM mshta.exe /T >nul 2>&1

echo.
echo ===================================================
echo EVES shutdown complete.
echo ===================================================
timeout /t 2 >nul
