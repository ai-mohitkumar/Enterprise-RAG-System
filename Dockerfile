# Build the Next.js frontend and export static assets
FROM node:18-bullseye-slim AS frontend-builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 build-essential git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
ENV NEXT_PUBLIC_API_URL=/ 
RUN npm run build
RUN npx next export --outdir /app/frontend-out

# Runtime image for FastAPI + static frontend
FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc g++ build-essential libmagic1 poppler-utils tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements_prod.txt .
RUN python -m pip install --upgrade pip && pip install -r requirements_prod.txt
COPY backend ./backend
COPY --from=frontend-builder /app/frontend-out ./frontend-out

ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8080"]
