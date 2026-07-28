#!/usr/bin/env bash
# Local Development Execution Script

set -e

echo "Starting SecureCodeAI Services via Docker Compose..."
docker-compose -f docker/docker-compose.yml up --build
