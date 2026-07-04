# Casuya Platform — multi-stage build
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/ frontend/
RUN cp -r frontend/* /app/build/

FROM python:3.12-slim
RUN groupadd -r casuya && useradd -r -g casuya -d /app -s /sbin/nologin casuya

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ backend/
COPY integrations/ integrations/
COPY storage/ storage/
COPY --from=frontend /app/build/ frontend/

RUN chown -R casuya:casuya /app/storage

USER casuya

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
