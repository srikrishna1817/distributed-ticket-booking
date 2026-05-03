@echo off
echo =========================================
echo Ticket Booking System - Server Stop
echo =========================================

echo Stopping Flask instances on ports 5001, 5002, 5003...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5001') DO (
    taskkill /F /PID %%T 2>NUL
)
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5002') DO (
    taskkill /F /PID %%T 2>NUL
)
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5003') DO (
    taskkill /F /PID %%T 2>NUL
)

echo Stopping Nginx...
cd /d "C:\Users\K Srikrishna Kausik\Downloads\nginx-1.28.3\nginx-1.28.3"
nginx.exe -s stop 2>NUL
taskkill /F /IM nginx.exe 2>NUL

echo.
echo All servers cleanly stopped.
pause
