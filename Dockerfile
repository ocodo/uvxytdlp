# ---- #1: Build Frontend ----
FROM node:20-alpine AS frontend-builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html ./
COPY src ./src
COPY public ./public

RUN pnpm install
RUN pnpm exec vite build

# ---- #2: Integrate with lightty and server ----
FROM debian:bullseye-slim

RUN apt-get update && \
    apt-get install -y lighttpd python3 curl ca-certificates procps ffmpeg && \
    apt-get clean

COPY --from=frontend-builder /app/dist /var/www/html

COPY apiserver/lighttpd.conf /etc/lighttpd/lighttpd.conf
COPY apiserver/ /app/apiserver
COPY apiserver/docker.config.toml /app/apiserver/config.toml

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PATH="/app/apiserver/.venv/bin:$PATH"
ENV UVX_EXPECTED_PATH=/bin/uvx

WORKDIR /app/apiserver
RUN uv venv
RUN uv sync

EXPOSE 5000
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Change CMD to execute the start script
CMD ["/app/apiserver/start.sh"]
