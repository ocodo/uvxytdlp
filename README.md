# uvxytdlp-ui

Download and playback YouTube videos locally

# Run

### Front End

run from project root:

```sh
pnpm install
vite [--port <your port|5173++ default>] [--host <0.0.0.0|localhost default>
```

### Back End

The backend uses `uvx` to fetch a fresh version of `yt-dlp` daily.

Install `uv` (to get `uvx`)

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

To build the container:

```sh
docker build -t uvxytdlp-ui .
```

(for Podman it's the same, replace `docker` with `podman`)

To run with `uvxytdlp-ui` note downloads in the container are at is `/ytdlp-downloads/`. use `-v your_dir:/ytdlp-downloads` in you podman/docker run command: e.g.:

```sh
docker run -d -p 8080:80 -v /host/download_dir:/ytdlp-downloads --name uvxytdlp-ui-container uvxytdlp-ui
```

Optionally include the api server port, but it is not necessary to do so:

```sh
-p <your port>:3000
```

#### Start/Stop docker container

```sh
docker start uvxytdlp-ui-container
```

or

```sh
docker stop uvxytdlp-ui-container
```
