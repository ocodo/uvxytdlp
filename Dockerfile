FROM guergeiro/pnpm:lts-latest AS frontend-builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch

COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html ./
COPY src ./src
COPY public ./public
COPY apiserver ./apiserver

RUN pnpm install -r --offline --frozen-lockfile
RUN pnpm exec vite build

FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean

RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH="/root/.deno/bin:$PATH"

WORKDIR /app/apiserver

COPY apiserver/pyproject.toml apiserver/uv.lock* ./
RUN uv sync --frozen --no-dev

COPY apiserver/ .
COPY --from=frontend-builder /app/apiserver/dist ./dist
COPY apiserver/docker.config.yaml ./config.yaml

ENV PATH="/app/apiserver/.venv/bin:$PATH"

EXPOSE 8000

CMD ["./start.sh"]
