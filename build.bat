@echo off
REM TexMex Build Script for Windows
REM This script builds and packages the TexMex VS Code extension

echo.
echo ========================================
echo TexMex Build Script
echo ========================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Compiling TypeScript...
call npm run compile
if errorlevel 1 (
    echo [ERROR] Failed to compile TypeScript
    pause
    exit /b 1
)

echo.
echo [3/3] Packaging extension...
call npm run package
if errorlevel 1 (
    echo [ERROR] Failed to package extension
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Build completed!
echo ========================================
echo.
echo Installation Instructions:
echo 1. Open VS Code
echo 2. Press Ctrl+Shift+X
echo 3. Click ... menu and select "Install from VSIX..."
echo 4. Select the texmex-X.X.X.vsix file
echo.
echo To get started:
echo 1. Open a .tex file
echo 2. Press Ctrl+Shift+P
echo 3. Type "TexMex: Open Live Preview"
echo.
pause
