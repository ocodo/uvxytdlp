# uvxytdlp-ui

[![](https://img.shields.io/badge/marmalade-shadow-blue?style=for-the-badge)](https://github.com/ocodo/uvxytlp/pkgs/container/uvxytdlp%2Fuvxytdlp-ui)

Download and playback web video and audio locally, powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp), [uvx](https://astral.sh/uv) with [Vite](https://vitejs.dev), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), [Shadcn/ui](https://ui.shadcn.com) and [FastAPI](https://fastapi.tiangolo.com/) providing the basis for the WebUI and API Service.

### screenshots

Light mode

![](readme-images/uvxytdlp-1.png)

Dark mode

![](readme-images/uvxytdlp-2.png)

Search downloads

![](readme-images/uvxytdlp-3.png)

Safe delete with long press

![](readme-images/uvxytdlp-4.png)



# Run

Using Docker or Podman...

```bash
sudo docker run -d \
  -p 8080:80 \
  -v /path/to/your/downloads:/ytdlp-downloads \
  --name uvxytdlp-ui-container \
  ghcr.io/ocodo/uvxytdlp/uvxytdlp-ui:marmalade-shadow
```

Then go to http://localhost:8080

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
cd apiserver
```

Copy `config.example.toml` to `config.toml` and edit it to set the download folder.

```sh
uv venv
source .venv/bin/activate
fastapi dev
```

See `fastapi --help` for other options.

### Running in Docker/Podman

To build the container:

```sh
docker build -t uvxytdlp-ui .
```

(for Podman it's the same, replace `docker` with `podman`)

To run with `uvxytdlp-ui` note downloads in the container are at is `/ytdlp-downloads/`. use `-v your_dir:/ytdlp-downloads` in you podman/docker run command: e.g.:

```sh
docker run -d \
  -p 8080:80 \
  -v $local_download_dir:/ytdlp-downloads \
  --name uvxytdlp-ui-container \
  docker.io/library/uvxytdlp-ui
```

#### Start/Stop docker container

```sh
docker start uvxytdlp-ui-container
```

or

```sh
docker stop uvxytdlp-ui-container
```
