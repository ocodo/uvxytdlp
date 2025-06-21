# uvxytdlp-ui

[![](https://img.shields.io/badge/binary-cheesecake-blue?style=for-the-badge)](https://github.com/ocodo/uvxytlp/pkgs/container/uvxytdlp%2Fuvxytdlp-ui)

Download and playback YouTube videos locally, powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp), [uvx](https://astral.sh/uv) with [Vite](https://vitejs.dev), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), [Shadcn/ui](https://ui.shadcn.com), [APIFlask](https://apiflask.com) and [uvicorn](https://uvicorn.org) providing the WebUI and API Service.

# Run

Using Docker or Podman...

```bash
docker run -d \
  -p 8080:80 \
  -p 5150:5000 \
  -v YOUR_LOCAL_DOWNLOAD_PATH:/ytdlp-downloads \
  --name uvxytdlp-ui-container \
  ghcr.io/ocodo/uvxytdlp/uvxytdlp-ui:binary-cheesecake
```

Then go to http://localhost:8080

**Important Note:** The WebUI will look for the service on `5000` or `5150`, (open an [issue](https://github.com/ocodo/uvxytdlp/issues)) if you have to use a different port.)

- - -

# Local Dev version

## Run

### Front End

run from project root:

```sh
pnpm install
vite [--port <your port>] [--host <0.0.0.0>]
```

### Back End

The backend uses `uvx` to fetch a fresh version of `yt-dlp` daily.

Install `uv` (to get `uvx`)

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```
```sh
cd apiflask
```

Copy `config.example.toml` to `config.toml` and edit it to set the download folder.

```sh
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
docker run -d -p 8080:80 -p 5150:5000 -v $local_download_dir:/ytdlp-downloads --name uvxytdlp-ui-container uvxytdlp-ui
```

#### Start/Stop docker container

```sh
docker start uvxytdlp-ui-container
```

or

```sh
docker stop uvxytdlp-ui-container
```
