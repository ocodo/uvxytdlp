import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from omegaconf import OmegaConf
import os
import shlex
from datetime import datetime, timedelta
import subprocess
import logging
from urllib.parse import unquote
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import PlainTextResponse, FileResponse, StreamingResponse

app = FastAPI(
    title="API for uvxytdlp-ui",
    version="binary-cheesecake",
    docs_url=None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Configure basic logging for the application
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Load Configuration from config.toml ---
config_path = os.path.join(os.path.dirname(__file__), "config.yaml")
download_dir = os.path.join(os.path.dirname(__file__), "./downloads")

config = OmegaConf.load(config_path)
print(OmegaConf.to_yaml(config))

download_dir = config.downloads.download_dir or download_dir
print(download_dir)
visible_content = config.downloads.visible_content or []
print(visible_content)

if __name__ == "__main__":
    print("Starting http/json api for uvxytdlp-ui")

    if not os.path.exists(download_dir):
        os.makedirs(download_dir, exist_ok=True)

    print(f"Local Download folder: {download_dir}")
    print(os.listdir(download_dir))

# --- Configuration for daily cache refresh
# --- use a fresh yt-dlp everyday
LAST_REFRESH_FILE = os.path.join(os.path.dirname(__file__), "last_ytdlprefresh.txt")
REFRESH_INTERVAL = timedelta(days=1)

# --- locate uvx
UVX_FALLBACK_PATHS = [
    os.path.expanduser("~/.local/bin/uvx"),
]

UVX_EXPECTED_PATH = None

UVX_PATH_ENV = os.environ.get("UVX_EXPECTED_PATH")

if UVX_PATH_ENV:
    UVX_EXPECTED_PATH = UVX_PATH_ENV
elif UVX_FALLBACK_PATHS:
    for path in UVX_FALLBACK_PATHS:
        if os.path.exists(path):
            UVX_EXPECTED_PATH = path
            break

if __name__ == "__main__":
    if UVX_EXPECTED_PATH:
        print(f"\nSuccessfully determined uvx path: {UVX_EXPECTED_PATH}")
    else:
        print(
            "\nCould not locate uvx. Please ensure it's installed or set UVX_EXPECTED_PATH."
        )

def downloaded_files():
    files = []
    errors = []
    for entry in os.scandir(download_dir):
        _, ext = os.path.splitext(entry.name)
        is_file = entry.is_file()
        if is_file and ext.removeprefix('.') in visible_content:
            try:
                stat_info = entry.stat()
                files.append(
                    {
                        "name": entry.name,
                        "mtime": stat_info.st_mtime,
                        "ctime": stat_info.st_ctime,
                        "size": stat_info.st_size,
                    }
                )
            except Exception as e:
                logger.error(f"Error getting info for file {entry.name}: {e}")
                errors.append(e)

    # Sort by newest first
    files.sort(key=lambda f: f["ctime"], reverse=True)
    return files, errors

def get_ytdlp_progress_template() -> str:
    """
    Returns the yt-dlp progress template string designed to output JSON.
    It's defined as a multi-line string for readability and then compacted
    to a single line suitable for yt-dlp's --progress-template argument.
    """
    template = """{ "percent": %(progress._percent)f }"""

    return "".join(line.strip() for line in template.splitlines())


def should_refresh_cache() -> bool:
    """Checks if the uvx cache should be refreshed."""
    try:
        with open(LAST_REFRESH_FILE, "r") as f:
            last_refresh_time = datetime.fromisoformat(f.read().strip())
        is_stale = datetime.now() - last_refresh_time > REFRESH_INTERVAL
        if is_stale:
            logger.info(f"Cache is stale (older than {REFRESH_INTERVAL}). Refreshing.")
        else:
            logger.info("Cache is fresh. No refresh needed.")
        return is_stale
    except Exception as e:
        logger.info(
            f"Could not determine cache age ({type(e).__name__}). Refreshing as a precaution."
        )
        return True


def record_refresh_timestamp() -> None:
    """Records the current time as the last refresh time."""
    try:
        with open(LAST_REFRESH_FILE, "w") as f:
            f.write(datetime.now().isoformat())
        logger.info(f"Cache refresh timestamp updated in {LAST_REFRESH_FILE}.")
    except Exception as e:
        logger.error(f"Failed to record refresh timestamp: {e}")


async def _stream_subprocess_output(process: asyncio.subprocess.Process, url: str):
    """
    Asynchronously streams stdout and stderr from a given subprocess,
    adding appropriate headers and handling process completion and errors.
    """
    stderr_buffer = (
        b""  # Buffer for stderr to potentially display at the end or on error
    )
    try:
        # Stream stdout
        yield b"--- STDOUT ---\n"
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            yield line

        # Read all stderr into a buffer
        # This ensures all stderr is captured before process.wait()
        # and allows displaying it together if needed.
        while True:
            line = await process.stderr.readline()
            if not line:
                break
            stderr_buffer += line

        if stderr_buffer:
            yield b"--- STDERR ---\n"
            yield stderr_buffer

        # Wait for the process to complete
        await process.wait()

        # Check return code and yield final status message
        if process.returncode != 0:
            error_message = (
                f"--- yt-dlp process exited with code {process.returncode} ---\n"
            ).encode("utf-8")
            yield error_message
            logger.warning(
                f"yt-dlp process for {url} exited with code {process.returncode}. "
                f"stderr: {stderr_buffer.decode('utf-8', errors='ignore')[:500]}"
            )
        else:
            yield b"--- yt-dlp process finished successfully ---\n"
            logger.info(f"Successfully processed URL: {url}")

    except asyncio.CancelledError:
        # Handle client disconnection
        logger.warning(f"Client disconnected for {url}. Terminating yt-dlp process.")
        if process.returncode is None:  # Process might still be running
            process.terminate()
            try:
                await asyncio.wait_for(process.wait(), timeout=5)
            except asyncio.TimeoutError:
                logger.error(
                    f"yt-dlp process for {url} did not terminate gracefully. Killing."
                )
                process.kill()
        raise  # Re-raise CancelledError to ensure FastAPI/Starlette handles it

    except Exception as e:
        # Catch any unexpected errors during streaming or process management
        logger.exception(f"An unexpected error occurred while processing {url}: {e}")
        yield f"--- Server Error ---\n{str(e)}\n".encode("utf-8")

    finally:
        # Ensure process is terminated if it's still running when exiting the generator
        if process.returncode is None:
            logger.warning(
                f"yt-dlp process for {url} was still running in finally block. Killing."
            )
            process.kill()
            await process.wait()


@app.get("/docs", include_in_schema=False)
async def api_documentation(request: Request):
    return HTMLResponse("""
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Elements in HTML</title>

    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
  </head>
  <body>

    <elements-api
      apiDescriptionUrl="openapi.json"
      router="hash"
    />

  </body>
</html>""")


@app.get("/ytdlp")
async def download_via_ytdlp(url: str, args: str):
    global download_dir
    url = unquote(url)
    args = unquote(args)
    logger.info(f"download dir is: {download_dir}")
    logger.info(f"Received request for URL: {url} with args: {args}")

    if not (
        os.path.exists(UVX_EXPECTED_PATH) and os.access(UVX_EXPECTED_PATH, os.X_OK)
    ):
        logger.error(f"uvx not found or not executable at {UVX_EXPECTED_PATH}.")
        return PlainTextResponse("UVX required on server", status_code=500)

    logger.info(f"Using uvx from: {UVX_EXPECTED_PATH}")
    uvx_command_parts = [UVX_EXPECTED_PATH]

    if should_refresh_cache():
        uvx_command_parts.append("--no-cache")
        record_refresh_timestamp()

    try:
        parsed_args = shlex.split(args)
    except ValueError as e:
        logger.error(f"Error splitting yt-dlp arguments '{args}': {e}")
        raise HTTPException(
            status_code=400, detail=f"Invalid yt-dlp arguments format: {e}"
        )

    if not download_dir.endswith(os.sep):
        download_dir = download_dir + os.sep

    full_command = (
        uvx_command_parts
        + ["yt-dlp", "-o", f"{download_dir}%(title)s.%(ext)s"]
        + ["--newline"]
        + ["--write-thumbnail"]
        + ["--write-description"]
        + ["--write-info-json"]
        + ["--progress-delta=0.05"]
        + ["--progress-template", f"{get_ytdlp_progress_template()}"]
        + parsed_args
        + [f"{url}"]
    )

    logger.info(
        f"Executing command: {' '.join(shlex.quote(part) for part in full_command)}"
    )

    print(*full_command)

    process = await asyncio.create_subprocess_exec(
        *full_command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env={**os.environ, "PYTHONUNBUFFERED": "1"},
    )

    return StreamingResponse(
        _stream_subprocess_output(process, url), media_type="text/event-stream"
    )


def serve_file_from_dir(filename: str, base_dir: str, force_download: bool = False):
    full_path = os.path.join(base_dir, filename)
    # Security check: prevent directory traversal
    if not os.path.abspath(full_path).startswith(os.path.abspath(base_dir)):
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        if force_download:
            return FileResponse(full_path, filename=filename)
        else:
            return FileResponse(full_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: Could not serve file: {str(e)}")


@app.get("/download/{filename:path}")
def download_content(filename: str):
    return serve_file_from_dir(filename, download_dir, force_download=True)


@app.get("/downloaded/{filename:path}")
def get_downloaded_content(filename: str):
    return serve_file_from_dir(filename, download_dir, force_download=False)


# --- API Route to list downloaded files ---
@app.get("/downloaded")
def get_downloaded():
    try:
        files, errors = downloaded_files()
        return (files, errors)
    except Exception as e:
        logger.exception(
            f"Error listing files in download directory {download_dir}: {e}"
        )
        raise HTTPException(
            status_code=500, detail=f"Server Error: Could not list files: {str(e)}"
        )


@app.delete("/downloaded/{filename:path}")  # fmt: skip
def delete_downloaded_file(filename: str):
    """
    Deletes a specific file from the download directory.
    """
    full_path = os.path.join(download_dir, filename)

    # Security check: prevent directory traversal
    if not os.path.abspath(full_path).startswith(os.path.abspath(download_dir)):
        logger.warning(f"Attempted directory traversal for deletion: {filename}")
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        logger.warning(f"File not found for deletion: {full_path}")
        raise HTTPException(status_code=404, detail="File not found")

    try:
        os.remove(full_path)
        logger.info(f"Successfully deleted file: {full_path}")
        return {"message": f"File '{filename}' deleted successfully."}
    except Exception as e:
        logger.exception(f"Error deleting file {full_path}: {e}")


@app.get("/health", tags=["Health"])
@app.head("/health", tags=["Health"])
def health_check():
    """
    A simple health check endpoint that confirms the API server is running.
    This is useful for container orchestration systems (like Docker Swarm or
    Kubernetes) and load balancers to verify service availability.
    """
    return {"status": "ok"}
