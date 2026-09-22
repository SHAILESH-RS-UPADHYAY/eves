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
echo Shortcuts (Alt-based — Zero Acemate collision):
echo   Alt + D          ^| Toggle Dashboard
echo   Alt + L          ^| Start / Stop listening
echo   Alt + Backspace  ^| Hide / Show Overlay
echo   Alt + O          ^| Toggle audio source (loopback / mic)
echo   Alt + T          ^| Toggle click-through mode
echo   Alt + Space      ^| Synthesize session
echo   Alt + Q          ^| Quit EVES
echo.
echo ===================================================
echo.

node "%~dp0runner.js" --dashboard

pause
