# ---- #1: Build Frontend ----
FROM node:20-alpine AS frontend-builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html ./
COPY src ./src
COPY public ./public

COPY src/lib/docker.config.ts ./src/lib/config.ts

RUN pnpm install
RUN pnpm exec vite build

# ---- #2: Integrate with server ----
FROM debian:bullseye-slim

RUN apt-get update && \
    apt-get install -y lighttpd python3 curl ca-certificates procps && \
    apt-get clean

COPY --from=frontend-builder /app/dist /var/www/html

COPY apiflask/lighttpd.conf /etc/lighttpd/lighttpd.conf
COPY apiflask/ /app/apiflask
COPY apiflask/docker.config.toml /app/apiflask/config.toml

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PATH="/app/apiflask/.venv/bin:$PATH"

WORKDIR /app/apiflask
RUN uv venv
RUN uv pip install -r requirements.txt

EXPOSE 80
EXPOSE 5000

CMD ["/bin/bash", "-c", "apiflask -A app.py run --host=127.0.0.1 --port=5000 & lighttpd -D -f /etc/lighttpd/lighttpd.conf"]
