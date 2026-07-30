#!/bin/bash
# start_dev.sh - Boot all SecureCode-AI services locally

# 1. Start Docker Desktop (macOS)
echo "Starting Docker Desktop..."
open -a Docker

# 2. Start Redis Server in the background
echo "Starting Redis Server..."
redis-server &
REDIS_PID=$!

# Wait a few seconds for Redis to initialize
sleep 2

# 3. Start Celery Worker in the background
echo "Starting Celery Worker..."
cd backend
celery -A config worker -l INFO &
CELERY_PID=$!

# 4. Start Daphne ASGI Backend Server in the foreground
echo "Starting Daphne Web Server on port 8000..."
daphne -b 127.0.0.1 -p 8000 config.asgi:application

# Cleanup when Daphne is killed (Ctrl+C)
trap "kill $REDIS_PID $CELERY_PID" EXIT
