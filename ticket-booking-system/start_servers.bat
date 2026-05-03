@echo off
echo =========================================
echo Ticket Booking System - Server Start
echo =========================================

cd %~dp0

echo Starting Flask Instance 1 on Port 5001...
start "Flask-5001" cmd /c "title Flask-5001 && set PORT=5001 && python app.py"

echo Starting Flask Instance 2 on Port 5002...
start "Flask-5002" cmd /c "title Flask-5002 && set PORT=5002 && python app.py"

echo Starting Flask Instance 3 on Port 5003...
start "Flask-5003" cmd /c "title Flask-5003 && set PORT=5003 && python app.py"

echo Starting Nginx Load Balancer...
cd /d "C:\Users\K Srikrishna Kausik\Downloads\nginx-1.28.3\nginx-1.28.3"
start nginx.exe

echo.
echo All servers have been triggered!
echo   - 3x Flask on Ports: 5001, 5002, 5003
echo   - 1x Nginx  on Port: 80
echo.
echo Please review the separate console windows for Flask logs.
pause
