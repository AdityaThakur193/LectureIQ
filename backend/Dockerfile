FROM python:3.12

WORKDIR /app

# Install system dependencies required for openai-whisper and audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    build-essential \
    rustc \
    cargo \
    && rm -rf /var/lib/apt/lists/*

# Install setuptools first to avoid pkg_resources issues
RUN pip install --no-cache-dir setuptools>=65.0.0

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
