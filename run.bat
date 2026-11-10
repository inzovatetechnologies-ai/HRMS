@echo off
title INZOVATE HRMS - Enterprise Server
cd /d "%~dp0"
set PATH=%PATH%;C:\Program Files\nodejs;C:\Users\HP\nodejs
rem Disable Windows QuickEdit to prevent accidental terminal freeze
reg add HKCU\Console /v QuickEdit /t REG_DWORD /d 0 /f >nul 2>&1

echo ========================================================
echo   INZOVATE ENTERPRISE HRMS - STARTING SERVER
echo ========================================================
echo.
echo Server is initializing on http://localhost:3000...
echo Browser will automatically open once server is 100%% ready.
echo.

rem Launch browser in background only after server responds
start /b powershell -Command "while ($true) { try { $r = (Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/me' -UseBasicParsing -TimeoutSec 2).StatusCode } catch { $r = $_.Exception.Response.StatusCode.value__ }; if ($r -eq 401 -or $r -eq 200) { Start-Process 'http://localhost:3000'; break }; Start-Sleep -Seconds 1 }"

:loop
node --max-old-space-size=2048 node_modules\next\dist\bin\next dev -p 3000
echo Server restarting in 1 second...
timeout /t 1 /nobreak >nul
goto loop
