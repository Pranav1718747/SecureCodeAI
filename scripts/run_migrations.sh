#!/bin/bash
set -e

echo "Running database migrations..."
cd backend
python3 manage.py makemigrations
python3 manage.py migrate

echo "Seeding database..."
cd ..
python3 scripts/seed_db.py

echo "Done!"
