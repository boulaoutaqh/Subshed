@echo off
echo.
echo  =========================================
echo    Subshed - Setup (Run this FIRST)
echo  =========================================
echo.
echo  [1/3] Installing dependencies...
call npm install
echo.
echo  [2/3] Setting up database...
call npx prisma generate
call npx prisma db push
echo.
echo  [3/3] Done!
echo.
echo  Now run: 2-START.bat
echo.
pause
