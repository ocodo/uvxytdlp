# uvxytdlp-ui

built on Vite/React/Tailwind/ShadCN


Download and playback YouTube videos locally

Uses `uvx` to fetch a fresh version of `yt-dlp` daily.

Requires `uv` and `uvx` to be installed at `~/.cargo/bin/{uv,uvx}`

backend is built with APIFlask

# Run

### Front End

run from project root:

```sh
pnpm install
vite [--port <your port|5173++ default>] [--host <0.0.0.0|localhost default>
```

### Back End

Install uv:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

```sh
cd apiflask
uv venv
source .venv/bin/activate
apiflask -A app.py -p <your port|default 5000> -h <your host|default localhost>
```
