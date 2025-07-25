FROM guergeiro/pnpm:22-8 AS frontend-builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html ./
COPY src ./src
COPY public ./public
COPY apiserver ./apiserver

RUN pnpm install
RUN pnpm exec vite build

FROM ghcr.io/astral-sh/uv:0.8-python3.11-bookworm

COPY apiserver/ /app/apiserver
COPY apiserver/docker.config.yaml /app/apiserver/config.yaml

COPY --from=frontend-builder /app/apiserver/dist /app/apiserver/dist
ENV PATH=/app/apiserver/.venv/bin:$PATH

WORKDIR /app/apiserver

RUN uv venv --relocatable --clear
RUN uv sync --frozen

EXPOSE 8000

CMD ["./start.sh"]
