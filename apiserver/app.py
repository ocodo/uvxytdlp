import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import shlex
from datetime import datetime, timedelta
import subprocess
import logging
import toml # type: ignore
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import PlainTextResponse, FileResponse, StreamingResponse

app = FastAPI(
    title="API for uvxytdlp-ui",
    version="binary-cheesecake",
    docs_url="/docs", # FastAPI's default docs path
    redoc_url="/redoc", # FastAPI's default redoc path
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

# Configure basic logging for the application
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Load Configuration from config.toml ---
config_path = os.path.join(os.path.dirname(__file__), "config.toml")

try:
    config = toml.load(config_path)
    logger.info(f"Loaded configuration from {config_path}")
    if not config.get("download_dir"):
        logger.error("Download directory not configured in config.toml")
        raise RuntimeError("Download directory not configured in config.toml")
    else:
        download_dir = config["download_dir"]
        if not os.path.exists(download_dir):
            os.makedirs(download_dir, exist_ok=True)
            logger.info(f"Created download directory: {download_dir}")
        else:
            logger.info(f"Using download directory: {download_dir}")

except toml.TomlDecodeError as e:
    logger.error(f"Error decoding TOML in {config_path}: {e}")
    raise RuntimeError(f"Error decoding TOML in {config_path}: {e}")
except FileNotFoundError:
    logger.warning(
        f"Configuration file not found: {config_path}. Using default settings."
    )
    config = {} # Ensure config is defined even if file not found
    download_dir = "/tmp/downloads" # Default or placeholder for testing/no config

if __name__ == "__main__":
    print("Starting http/json api for uvxytdlp-ui")
    print(f"Local Download folder: {config.get('download_dir', download_dir)}")
    if os.path.exists(download_dir):
        print(os.listdir(download_dir))

# --- Configuration for daily cache refresh
# --- always use a fresh yt-dlp everyday
LAST_REFRESH_FILE = os.path.join(os.path.dirname(__file__), "last_ytdlprefresh.txt")
REFRESH_INTERVAL = timedelta(days=1)

# --- locate uvx
UVX_FALLBACK_PATHS = [
    os.path.expanduser("~/.cargo/bin/uvx"),
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


def should_refresh_cache() -> bool:
    """Checks if the uvx cache should be refreshed."""
    try:
        with open(LAST_REFRESH_FILE, "r") as f:
            last_refresh_time = datetime.fromisoformat(f.read().strip())
        is_stale = datetime.now() - last_refresh_time > REFRESH_INTERVAL
        if is_stale:
            logger.info(
                f"Cache is stale (older than {REFRESH_INTERVAL}). Refreshing."
            )
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


class YtdlpInput(BaseModel):
    url: str
    args: str


@app.post("/ytdlp")
async def download_via_ytdlp(body: YtdlpInput):
    logger.info(f"download dir is: {download_dir}")
    logger.info(f"Received request for URL: {body.url} with args: {body.args}")

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
        parsed_args = shlex.split(body.args)
    except ValueError as e:
        logger.error(f"Error splitting yt-dlp arguments '{body.args}': {e}")
        raise HTTPException(
            status_code=400, detail=f"Invalid yt-dlp arguments format: {e}"
        )

    os.makedirs(download_dir, exist_ok=True)

    full_command = (
        uvx_command_parts
        + ["yt-dlp", "-o", f"{download_dir}/%(title)s.%(ext)s"]
        + parsed_args
        + [body.url]
    )

    logger.info(
        f"Executing command: {' '.join(shlex.quote(part) for part in full_command)}"
    )

    async def stream_output_generator():
        process = await asyncio.create_subprocess_exec(
            *full_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        try:
            yield b"--- STDOUT ---\n"
            while True:
                line = await process.stdout.readline()
                if not line:
                    break
                yield line

            stderr_output = b""
            while True:
                line = await process.stderr.readline()
                if not line:
                    break
                stderr_output += line

            if stderr_output:
                yield b"--- STDERR ---\n"
                yield stderr_output

            await process.wait()

            if process.returncode != 0:
                error_message = (
                    f"--- yt-dlp process exited with code {process.returncode} ---\n"
                ).encode('utf-8')
                yield error_message
                logger.warning(
                    f"yt-dlp process for {body.url} exited with code {process.returncode}. "
                    f"stderr: {stderr_output.decode('utf-8', errors='ignore')[:500]}"
                )
            else:
                yield b"--- yt-dlp process finished successfully ---\n"

            logger.info(f"Successfully processed URL: {body.url}")

        except asyncio.CancelledError:
            logger.warning(f"Client disconnected for {body.url}. Terminating yt-dlp process.")
            if process.returncode is None:
                process.terminate()
                try:
                    await asyncio.wait_for(process.wait(), timeout=5)
                except asyncio.TimeoutError:
                    logger.error(f"yt-dlp process for {body.url} did not terminate gracefully. Killing.")
                    process.kill()
            raise

        except Exception as e:
            logger.exception(f"An unexpected error occurred while processing {body.url}: {e}")
            yield f"--- Server Error ---\n{str(e)}\n".encode('utf-8')

        finally:
            if process.returncode is None:
                logger.warning(f"yt-dlp process for {body.url} was still running in finally block. Killing.")
                process.kill()
                await process.wait()

    return StreamingResponse(stream_output_generator(), media_type="text/plain")


@app.get("/downloaded/{filename:path}")
def get_downloaded_content(filename: str):
    # check for the filename in the config download_dir
    # and then stream it back to the caller
    full_path = os.path.join(download_dir, filename)
    logger.info(f"Requested content: {full_path}")

    # Basic security check: prevent directory traversal
    if not os.path.abspath(full_path).startswith(os.path.abspath(download_dir)):
        logger.warning(f"Attempted directory traversal: {filename}")
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        logger.warning(f"File not found: {full_path}")
        raise HTTPException(status_code=404, detail="File not found")

    try:
        # Use send_file to stream the file
        logger.info(f"Serving file: {full_path}")
        return FileResponse(full_path)
    except Exception as e:
        logger.exception(f"Error serving file {full_path}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Server Error: Could not serve file: {str(e)}"
        )


# --- API Route to list downloaded files ---
@app.get("/downloaded")
def get_downloaded():
    try:
        files = []
        for entry in os.scandir(download_dir):
            if entry.is_file():
                try:
                    stat_info = entry.stat()
                    files.append(
                        {
                            "name": entry.name,
                            "mtime": datetime.fromtimestamp(
                                stat_info.st_mtime
                            ).isoformat(),
                            "size": stat_info.st_size,
                        }
                    )
                except Exception as e:
                    logger.error(f"Error getting info for file {entry.name}: {e}")
        # Optional: Sort files by modification time, newest first
        files.sort(key=lambda x: x["mtime"], reverse=True)
        return files
    except Exception as e:
        logger.exception(
            f"Error listing files in download directory {download_dir}: {e}"
        )
        raise HTTPException(
            status_code=500, detail=f"Server Error: Could not list files: {str(e)}"
        )


@app.delete("/downloaded/{filename:path}") # fmt: skip
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
