FROM python:3.12

WORKDIR /app

# Install system dependencies (ffmpeg for audio/video processing)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install setuptools first to avoid pkg_resources issues
RUN pip install --no-cache-dir setuptools>=65.0.0

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make entrypoint executable and copy it
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Run the application
ENTRYPOINT ["/app/entrypoint.sh"]

