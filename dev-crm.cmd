@echo off
title Macee CRM ^& Admin Portal (Dev Mode)
echo ========================================================
echo   MACEE CRM ^& ADMIN MANAGEMENT PORTAL (DEV)
echo   Running on Next.js - Port 3001
echo ========================================================
echo.
cd /d "%~dp0"
node ./node_modules/next/dist/bin/next dev -p 3001
pause
