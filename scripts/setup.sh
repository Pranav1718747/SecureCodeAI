#!/usr/bin/env bash
# Environment Bootstrapping Script for SecureCodeAI Platform

set -e

echo "=== Initializing SecureCodeAI Environment ==="

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "=== Environment Setup Complete ==="
