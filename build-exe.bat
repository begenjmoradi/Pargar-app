@echo off
chcp 65001 >nul
where node >nul 2>nul || (echo Node.js نصب نیست. از https://nodejs.org نسخه LTS را نصب کنید. & pause & exit /b 1)
call npm install || (pause & exit /b 1)
call npm run dist
echo.
echo فایل exe در پوشه dist ساخته شد.
pause
