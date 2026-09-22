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
echo    MEETING INTELLIGENCE SYSTEM
echo.
echo ===================================================
echo.
echo [SYS] Initializing EVES Core...
echo [SYS] Starting Service...
echo.
echo Shortcuts (Alt-based — Zero Acemate collision):
echo   Alt + L          ^| Start / Stop listening
echo   Alt + Backspace  ^| Hide / Show Overlay
echo   Alt + D          ^| Open / Close Dashboard
echo   Alt + O          ^| Toggle audio source
echo   Alt + T          ^| Toggle click-through mode
echo   Alt + Space      ^| Synthesize session
echo   Alt + Q          ^| Quit EVES
echo.
echo ===================================================
echo.

node "%~dp0runner.js"

pause
