# ---- Stage 1: Build Frontend ----
FROM node:20-alpine AS frontend-builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy frontend project files necessary for build
COPY package.json pnpm-lock.yaml ./
# Assuming these are your main config/entry files for Vite
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html ./
COPY src ./src
COPY src/lib/docker.config.ts ./src/lib/config.ts
COPY public ./public

# Install dependencies and build
RUN pnpm install
RUN pnpm exec vite build
# Frontend build output will be in /app/dist

# ---- Stage 2: Setup Backend ----
FROM python:3.12-slim-bookworm AS backend-builder

# The installer requires curl (and certificates) to download the release archive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates
# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh
# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh
# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

WORKDIR /app/apiflask

# Copy backend files (app.py, config.toml, etc.)
COPY apiflask/ ./
COPY apiflask/docker.config.toml ./config.toml

# Create virtual environment and install dependencies
# Assuming app.py uses apiflask and relies on uvx for yt-dlp
RUN pip install apiflask

# ---- Stage 3: Final Image ----
FROM debian:bullseye-slim

# Install runtime dependencies: lighttpd, python3, curl (for uv)
RUN apt-get update && \
    apt-get install -y lighttpd python3 curl procps && \
    apt-get clean

# --- Lighttpd Setup ---
# Copy custom lighttpd configuration
COPY apiflask/lighttpd.conf /etc/lighttpd/lighttpd.conf

# Copy frontend build from frontend-builder stage to lighttpd webroot
COPY --from=frontend-builder /app/dist /var/www/html

# --- Backend Setup ---
WORKDIR /app/apiflask

# Copy backend virtual environment and application code from backend-builder stage
COPY --from=backend-builder /app/apiflask/ /app/apiflask/

# Ensure config.toml is in place (copied with the rest of apiflask)
# If config.toml was outside apiflask dir, it would need a separate COPY:
# COPY apiflask/config.toml /app/apiflask/config.toml

# --- Ports ---
  # For lighttpd (frontend)
EXPOSE 80
# For APIFlask backend
EXPOSE 3000

# --- Startup ---
# Copy and set executable for the startup script
COPY start-services.sh /start-services.sh
RUN chmod +x /start-services.sh

CMD ["/start-services.sh"]
