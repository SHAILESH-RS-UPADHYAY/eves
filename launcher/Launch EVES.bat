@echo off
title EVES // Meeting Intelligence
color 0D
cls

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
echo [SYS] Initializing EVES Core...
echo [SYS] Starting Service...
echo.
echo Hotkeys:
echo   Ctrl+Shift+L  ^| Start / Stop listening
echo   Ctrl+Shift+D  ^| Open / Close Dashboard
echo   Ctrl+Shift+O  ^| Toggle audio source
echo   Ctrl+Space    ^| Synthesize session
echo   Ctrl+Shift+X  ^| Quit EVES
echo.
echo ===================================================
echo.

node "%~dp0runner.js"

pause
