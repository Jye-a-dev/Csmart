#!/bin/bash

# Default values
PORT=8000

# Load .env file if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ "$1" = "start" ]; then
    echo "[1/2] Installing requirements..."
    pip install --user -r ./ai-engine/requirements.txt

    echo "[2/2] Starting FastAPI app on port $PORT..."
    cd ai-engine
    python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
    cd ..
else
    echo "Usage: ./run.sh start"
fi
