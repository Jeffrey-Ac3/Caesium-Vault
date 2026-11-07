@echo off
title Caesium Vault Launcher
color 0A

echo ==========================================
echo   CAESIUM VAULT - Starting All Services
echo ==========================================
echo.

:: Set base directory to the folder this .bat lives in
set "BASE=%~dp0"
set "KIWIX_EXE=%BASE%kiwix\kiwix-serve.exe"
set "LIBRARY=%BASE%backend\library.xml"
set "BACKEND=%BASE%backend"
set "FRONTEND=%BASE%frontend"

:: Detect Host Wi-Fi / Router Local IPv4 Address
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.254*' } | Select-Object -First 1).IPAddress"`) do set "HOST_IP=%%i"

:: ---- 1. Start Kiwix Server (port 8080) ----
echo [1/3] Starting Kiwix Server on port 8080...
if not exist "%KIWIX_EXE%" (
    echo       ERROR: kiwix-serve.exe not found at %KIWIX_EXE%
    pause
    exit /b 1
)
start "Kiwix Server" /min "%KIWIX_EXE%" --library "%LIBRARY%" --port 8080
echo       Kiwix Server started.
echo.

:: ---- 2. Start Backend Node.js Server (port 3001) ----
echo [2/3] Starting Backend Server on port 3001...
if not exist "%BACKEND%\server.js" (
    echo       ERROR: backend\server.js not found.
    pause
    exit /b 1
)
start "Caesium Backend" /min cmd /k "cd /d "%BACKEND%" && node server.js"
echo       Backend Server started.
echo.

:: ---- 3. Start Frontend Next.js Dev Server (port 3000) ----
echo [3/3] Starting Frontend on port 3000...
if not exist "%FRONTEND%\package.json" (
    echo       ERROR: frontend\package.json not found.
    pause
    exit /b 1
)
start "Caesium Frontend" /min cmd /k "cd /d "%FRONTEND%" && npm run dev"
echo       Frontend started.
echo.

echo ==========================================
echo   All services are launching!
echo ==========================================
echo.
echo   Opening Caesium Vault in your browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo.
echo.
echo   Local Laptop Access:
echo     Frontend  : http://localhost:3000
echo     Backend   : http://localhost:3001
echo     Kiwix     : http://localhost:8080
echo.
if defined HOST_IP (
echo   ----------------------------------------
echo   ROUTER / WI-FI NETWORK ACCESS (OTHER DEVICES):
echo   Connect any PC, phone, or tablet to the
echo   same Wi-Fi / router, open browser, and visit:
echo.
echo     ==^>  http://%HOST_IP%:3000
echo.
echo   (If other PCs cannot connect, ensure Windows
echo    Firewall allows Node.js on Private networks)
echo   ----------------------------------------
) else (
echo   Note: Connect to a Wi-Fi router to allow
echo   other devices to connect via IP address.
)
echo.
echo   Close this window or press any key to exit the launcher.
echo   (The service windows will keep running independently)
pause >nul
