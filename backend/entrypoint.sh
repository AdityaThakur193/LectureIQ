#!/bin/bash
set -e

# Use PORT environment variable or default to 8000
PORT=${PORT:-8000}

echo "Starting LectureIQ Backend on port $PORT..."

# Start Uvicorn server
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
