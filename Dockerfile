# ---- #1: Build Frontend ----
FROM node:20-alpine AS frontend-builder

WORKDIR /app
# Install pnpm
RUN npm install -g pnpm
# Copy frontend project files necessary for build
COPY package.json pnpm-lock.yaml ./
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html ./
COPY src ./src
COPY public ./public

# Use Docker specific config.ts
COPY src/lib/docker.config.ts ./src/lib/config.ts

# build frontend
RUN pnpm install
RUN pnpm exec vite build

# ---- #2: Setup Backend ----
FROM python:3.12-slim-bookworm AS backend-builder

WORKDIR /app/apiflask
# Copy backend files
COPY apiflask/ ./
# Use Docker specific config.toml
COPY apiflask/docker.config.toml ./config.toml

# ---- #3: Integrate ----
FROM debian:bullseye-slim

# Install runtime dependencies: lighttpd, python3, curl (for uv)
RUN apt-get update && \
    apt-get install -y lighttpd python3 curl ca-certificates procps && \
    apt-get clean

# --- Lighttpd Setup ---
# Copy custom lighttpd configuration
COPY apiflask/lighttpd.conf /etc/lighttpd/lighttpd.conf

# Copy frontend build to lightty
COPY --from=frontend-builder /app/dist /var/www/html
# Copy application code from backend-builder stage
COPY --from=backend-builder /app/apiflask/ /app/apiflask/

WORKDIR /app/apiflask
# --- Startup ---
# Copy and set executable for the startup script
COPY start-services.sh /start-services.sh
RUN chmod +x /start-services.sh

# --- Ports ---
EXPOSE 80
EXPOSE 5000

CMD ["/start-services.sh"]
