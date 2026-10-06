#!/bin/bash
set -e

echo "==> Running database migrations..."
python backend/manage.py migrate --noinput

echo "==> Starting Celery worker in background..."
(cd backend && celery -A config worker -l INFO --concurrency=2) &

echo "==> Starting Daphne ASGI server on port ${PORT:-8000}..."
cd backend
exec daphne -b 0.0.0.0 -p "${PORT:-8000}" config.asgi:application
