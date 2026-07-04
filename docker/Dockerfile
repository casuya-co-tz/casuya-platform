# Casuya Platform — multi-stage build
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/ frontend/
RUN cp -r frontend/* /app/build/

FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ backend/
COPY integrations/ integrations/
COPY storage/ storage/
COPY --from=frontend /app/build/ frontend/
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
