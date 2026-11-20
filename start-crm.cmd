@echo off
title Macee CRM ^& Admin Portal
echo ========================================================
echo   MACEE CRM ^& ADMIN MANAGEMENT PORTAL
echo   Running on Next.js - Port 3001
echo ========================================================
echo.
echo Website sync directory: d:\J&F\Maceee\macee-_update_contant
echo.
cd /d "%~dp0"
node ./node_modules/next/dist/bin/next start -p 3001
pause
