@echo off
setlocal enabledelayedexpansion

set PORT=8000

if not exist .env goto :skip_env
for /f "usebackq tokens=1,2 delims==" %%i in (".env") do set %%i=%%j
:skip_env

if not "%1"=="start" goto :usage

echo [1/2] Installing requirements...
pip install --user -r ./ai-engine/requirements.txt

cd ai-engine
:loop
echo [2/2] Starting FastAPI app on port %PORT%...
python -m uvicorn app.main:app --host 0.0.0.0 --port %PORT%
echo.
set /p CHOICE="Type 'r' and Enter to reload/restart, or any other key to exit: "
if /I "!CHOICE!"=="r" goto :loop
cd ..
goto :eof

:usage
echo Usage: run start
