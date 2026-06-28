@echo off
title EVES Dashboard
color 0D

echo ===================================================
echo.
echo    ███████╗██╗   ██╗███████╗███████╗
echo    ██╔════╝██║   ██║██╔════╝██╔════╝
echo    █████╗  ██║   ██║█████╗  ███████╗
echo    ██╔══╝  ╚██╗ ██╔╝██╔══╝  ╚════██║
echo    ███████╗ ╚████╔╝ ███████╗███████║
echo    ╚══════╝  ╚═══╝  ╚══════╝╚══════╝
echo.
echo    MEETING INTELLIGENCE DASHBOARD
echo.
echo ===================================================
echo.
echo Launching EVES...
echo Press Ctrl+Shift+D once open to see the dashboard
echo Press Ctrl+Shift+X to quit
echo.
echo ===================================================
echo.

cd /d "%~dp0"
npx electron-vite dev

pause
