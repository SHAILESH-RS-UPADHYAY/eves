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
echo   Alt + Backspace  ^| Hide / Show EVES popup
echo   Alt + O          ^| Cycle audio source (INT / EXT / BOTH)
echo   Alt + T          ^| Toggle click-through mode
echo   Alt + Space      ^| Stop + save session
echo   Alt + Q          ^| Quit EVES
echo.
echo ===================================================
echo.

node "%~dp0runner.js" --dashboard

pause
