# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copy package files first
COPY frontend/package*.json ./

# Install dependencies as root
RUN npm ci

# Copy source code
COPY frontend/ .

# Fix all permissions for node_modules/.bin
RUN chmod -R 755 node_modules/.bin/

# Build without type checking (using npx to avoid permission issues)
RUN npx vite build

# Stage 2: Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /frontend/dist ./backend/static

# Create necessary directories
RUN mkdir -p /app/backend/data /app/backend/uploads

WORKDIR /app/backend

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]