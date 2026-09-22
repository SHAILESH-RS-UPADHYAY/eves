@echo off
title EVES // Meeting Intelligence Dashboard
color 0B
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
echo [SYS] Initializing EVES Core Engine...
echo [SYS] Launching Dashboard Interface...
echo.
echo Available Hotkeys:
echo   Ctrl+Shift+L  ^| Start / Stop listening
echo   Ctrl+Shift+D  ^| Toggle Dashboard
echo   Ctrl+Shift+O  ^| Toggle audio source
echo   Ctrl+Space    ^| Synthesize session
echo   Ctrl+Shift+X  ^| Quit EVES
echo.
echo ===================================================
echo.

node "%~dp0runner.js" --dashboard

pause
