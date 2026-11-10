@echo off
title Inzovate HRMS Server
echo ========================================================
echo   INZOVATE TECHNOLOGIES PRIVATE LIMITED
echo   Inzovate AI HRMS — Enterprise Platform
echo ========================================================
echo.
echo Starting server on http://localhost:3000 ...
set "PATH=%PATH%;C:\Program Files\nodejs;C:\Users\HP\nodejs"
cd /d "%~dp0"
node node_modules\next\dist\bin\next start -p 3000
pause
