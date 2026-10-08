@echo off
setlocal
set ROOT=%~dp0..

start "SCM-auth-service" /D "%ROOT%\backend\services\auth-service" cmd /k npm run dev
start "SCM-complaint-service" /D "%ROOT%\backend\services\complaint-service" cmd /k npm run dev
start "SCM-notification-service" /D "%ROOT%\backend\services\notification-service" cmd /k npm run dev
start "SCM-gateway" /D "%ROOT%\backend\gateway" cmd /k npm run dev
start "SCM-frontend" /D "%ROOT%\frontend" cmd /k npm run dev

echo All services are starting in separate windows.
echo Frontend: http://localhost:5173
echo Gateway:  http://localhost:5000
endlocal
