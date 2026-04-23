@echo off
REM ============================================================
REM BDS Multi-Site — Deploy Script (Windows)
REM Copies Angular build output to public_html root alongside PHP
REM ============================================================

echo === BDS Deploy Script ===
echo.

REM 1. Clean old dist files
echo [1/4] Cleaning old build files from dist...
cd /d "%~dp0"
if exist "dist" (
    del /q "dist\*.*" >nul 2>&1
)
echo Cleaned.
echo.

REM 2. Build Angular production bundle
echo [2/4] Building Angular production bundle...
cd /d "%~dp0frontend"
call npx ng build --configuration=production
if errorlevel 1 (
    echo ERROR: Angular build failed!
    pause
    exit /b 1
)
echo Build complete.
echo.

REM 3. Copy build output to public_html root
echo [3/4] Copying build files to project root...
cd /d "%~dp0"

REM Copy index.html
copy /Y "dist\index.html" "index.html" >nul

REM Copy JS and CSS files (hashed names for cache busting)
copy /Y "dist\*.js" . >nul 2>&1
copy /Y "dist\*.css" . >nul 2>&1

REM Copy favicon
copy /Y "dist\favicon.ico" "favicon.ico" >nul 2>&1

echo Files copied.
echo.

REM 4. Done
echo [4/4] Deploy complete!
echo.
echo === Deployment Summary ===
echo - Angular files: index.html, *.js, *.css
echo - PHP API:       api/site.php, api/properties.php, api/lead.php
echo - Config:        core/config/db.php (update credentials!)
echo - Uploads:       uploads/{site_key}/
echo.
echo IMPORTANT: Update core/config/db.php with production DB credentials.
echo.
pause
