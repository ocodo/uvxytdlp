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

### Running in Docker/Podman

To run with docker using the supplied `Dockerfile` (note downloads in the container are at is `/ytdlp-downloads/`). It's recommended to use `-v your_dir:/ytdlp-downloads/` in you podman/docker run command.

```
docker build -t uvxytdlp-ui .
```

(for Podman it's the same, replace `docker` with `podman`)

