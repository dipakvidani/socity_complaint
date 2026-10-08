@echo off
setlocal

for %%P in (5000 5001 5002 5173) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
    taskkill /F /T /PID %%I >nul 2>&1
  )
)

taskkill /F /T /FI "WINDOWTITLE eq SCM-*" >nul 2>&1

echo All services have been stopped.
endlocal
