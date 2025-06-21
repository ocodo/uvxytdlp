# /// script
# dependencies = [
#   "fastapi",
#   "pydantic",
#   "python-multipart",
#   "starlette",
#   "toml",
# ]
# ///

# uv run & .venv takes care of all this,
# but ruff complains anyway
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import shlex
from datetime import datetime, timedelta
import subprocess
import logging
import toml  # type: ignore
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse, PlainTextResponse

app = FastAPI(
    title="API for uvxytdlp-ui",
    version="binary-cheesecake",
    docs_url="/docs",  # FastAPI's default docs path
    redoc_url="/redoc",  # FastAPI's default redoc path
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Configure basic logging for the application
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

print("Starting http/json api for uvxytdlp-ui")

# --- Load Configuration from config.toml ---
config_path = os.path.join(os.path.dirname(__file__), "config.toml")

if os.path.exists(config_path):
    try:
        config = toml.load(config_path)
        logger.info(f"Loaded configuration from {config_path}")
        if not config.get("download_dir"):
            logger.error("Download directory not configured in config.toml")
            exit(1)
        else:
            download_dir = config["download_dir"]
            if not os.path.exists(download_dir):
                os.makedirs(download_dir, exist_ok=True)
                logger.info(f"Created download directory: {download_dir}")
            else:
                logger.info(f"Using download directory: {download_dir}")

    except toml.TomlDecodeError as e:
        logger.error(f"Error decoding TOML in {config_path}: {e}")
else:
    logger.warning(
        f"Configuration file not found: {config_path}. Using default settings."
    )

print(f"Local Download folder: {config.get('download_dir', None)}")
print(os.listdir(config.get("download_dir", None)))

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

if UVX_EXPECTED_PATH:
    print(f"\nSuccessfully determined uvx path: {UVX_EXPECTED_PATH}")
else:
    print(
        "\nCould not locate uvx. Please ensure it's installed or set UVX_EXPECTED_PATH."
    )


def should_refresh_cache() -> bool:
    """Checks if the uvx cache should be refreshed."""
    if not os.path.exists(LAST_REFRESH_FILE):
        logger.info("No refresh timestamp file found. Refreshing cache.")
        return True
    try:
        with open(LAST_REFRESH_FILE, "r") as f:
            last_refresh_time_str = f.read().strip()
            if not last_refresh_time_str:
                logger.info("Refresh timestamp file is empty. Refreshing cache.")
                return True
            last_refresh_time = datetime.fromisoformat(last_refresh_time_str)

        if datetime.now() - last_refresh_time > REFRESH_INTERVAL:
            logger.info(
                f"More than {REFRESH_INTERVAL} passed since last refresh. Refreshing cache."
            )
            return True
    except ValueError:
        logger.error("Error parsing refresh timestamp. Refreshing cache.")
        return True  # If file is corrupted
    except Exception as e:
        logger.error(f"Error checking refresh timestamp: {e}. Refreshing cache.")
        return True
    logger.info("Cache refresh not needed at this time.")
    return False


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
def download_via_ytdlp(body: YtdlpInput):
    """
    Downloads a video using yt-dlp via uvx.
    Accepts url and yt-dlp args.
    """
    logger.info(f"download dir is: {download_dir}")
    logger.info(f"Received request for URL: {body.url} with args: {body.args}")

    # Check for uvx
    if not (
        os.path.exists(UVX_EXPECTED_PATH) and os.access(UVX_EXPECTED_PATH, os.X_OK)
    ):
        logger.error(f"uvx not found or not executable at {UVX_EXPECTED_PATH}.")
        return "UVX required on server", 500, {"Content-Type": "text/plain"}

    logger.info(f"Using uvx from: {UVX_EXPECTED_PATH}")
    uvx_command_parts = [UVX_EXPECTED_PATH]

    if should_refresh_cache():
        uvx_command_parts.append("--no-cache")
        record_refresh_timestamp()
    try:
        parsed_args = shlex.split(body.args)
    except ValueError as e:
        logger.error(f"Error splitting yt-dlp arguments '{body.args}': {e}")  # type: ignore
        raise HTTPException(
            status_code=400, detail=f"Invalid yt-dlp arguments format: {e}"
        )

    full_command = (
        uvx_command_parts
        + ["yt-dlp", "-o", f"{download_dir}/%(title)s.%(ext)s"]
        + parsed_args
        + [body.url]
    )

    logger.info(
        f"Executing command: {' '.join(shlex.quote(part) for part in full_command)}"
    )

    try:
        process = subprocess.run(
            full_command, capture_output=True, text=True, check=False
        )
        output_log = f"--- STDOUT ---\n{process.stdout}\n"
        if process.stderr:
            output_log += f"--- STDERR ---\n{process.stderr}\n"
        if process.returncode != 0:
            output_log += (
                f"--- yt-dlp process exited with code {process.returncode} ---\n"
            )
            logger.warning(
                f"yt-dlp process for {body.url} exited with code {process.returncode}. stderr: {process.stderr[:500]}"
            )
        logger.info(f"Successfully processed URL: {body.url}")

        return PlainTextResponse(output_log, status_code=200)

    except Exception as e:
        logger.exception(
            f"An unexpected error occurred while processing {body.url}: {e}"
        )
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")


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


@app.delete("/downloaded/{filename:path}")
async def delete_downloaded_file(filename: str):
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
