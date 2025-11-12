@echo off
echo ========================================
echo Starting AceMind Quiz System
echo ========================================
echo.

echo [1/3] Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Ollama not running. Starting Ollama...
    start "Ollama" ollama serve
    timeout /t 3 >nul
)
echo ✅ Ollama is running

echo.
echo [2/3] Starting Backend Server...
start "AceMind Backend" cmd /k "cd smartstudy\backend && python main.py"
timeout /t 3 >nul

echo.
echo [3/3] Starting Frontend...
start "AceMind Frontend" cmd /k "cd smartstudy\frontend && npm run dev"

echo.
echo ========================================
echo ✅ AceMind is starting!
echo ========================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3001
echo Docs:     http://localhost:4000/docs
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
taskkill /FI "WINDOWTITLE eq AceMind Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AceMind Frontend*" /F >nul 2>&1
echo ✅ Services stopped
