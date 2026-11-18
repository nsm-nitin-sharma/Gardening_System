@echo off
REM ============================================================================
REM  Online Gardening Community Platform - One-Click Launcher
REM  
REM  This script builds and starts the application, then opens the browser.
REM  No external database or server installation required.
REM  
REM  Usage: Double-click this file or run from command prompt.
REM ============================================================================

cd /d "%~dp0"

title Online Gardening Community Platform

echo.
echo  =========================================================
echo   Online Gardening Community Platform
echo   Starting application... Please wait.
echo  =========================================================
echo.

REM Check if Java is available
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Java is not installed or not in PATH.
    echo  Please install Java 21 or later from https://adoptium.net
    echo.
    pause
    exit /b 1
)

echo  [1/3] Checking Java installation... OK
echo.

REM Build the project (skip tests for faster startup)
echo  [2/3] Building the application...
call "%~dp0mvnw.cmd" package -DskipTests -q
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Build failed. Please check the output above for details.
    echo.
    pause
    exit /b 1
)
echo         Build complete.
echo.

REM Start the application in the background and open browser
echo  [3/3] Starting the server...
echo         The browser will open automatically in a few seconds.
echo         To stop the server, close this window.
echo.

REM Launch browser after a delay (5 seconds to allow Spring Boot startup)
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:8080"

REM Start Spring Boot (this blocks until the server is stopped)
java -jar "%~dp0target\gardening-community-platform-1.0.0-SNAPSHOT.jar"

echo.
echo  Server stopped.
pause
