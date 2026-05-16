# Combined Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install backend
COPY backend/requirements.txt .
RUN pip install fastapi uvicorn psutil

# Copy backend and frontend
COPY backend/ ./backend/
COPY frontend/dist/ ./frontend/dist/

WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]