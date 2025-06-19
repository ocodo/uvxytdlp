# /// script
# dependencies = [
#   "apiflask",
#   "flask_cors",
#   "toml",
# ]
# ///

# uv run & .venv takes care of all this,
# but ruff complains anyway
from apiflask import APIFlask, Schema
from flask_cors import CORS  # type: ignore
from apiflask.fields import String  # type: ignore
import os
import shlex
from datetime import datetime, timedelta
import subprocess
import logging
import toml  # type: ignore

app = APIFlask(__name__)
app.spec["info"]["title"] = "uvx ytdlp API"
CORS(app)

logger = logging.getLogger(__name__)


# --- Load Configuration from config.toml ---
config_path = os.path.join(os.path.dirname(__file__), "config.toml")
if os.path.exists(config_path):
    try:
        config = toml.load(config_path)
        app.config.update(config)
        logger.info(f"Loaded configuration from {config_path}")
    except toml.TomlDecodeError as e:
        logger.error(f"Error decoding TOML in {config_path}: {e}")
else:
    logger.warning(
        f"Configuration file not found: {config_path}. Using default settings."
    )

# Configure basic logging for the application
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Configuration for daily cache refresh --- always use a fresh yt-dlp everyday
LAST_REFRESH_FILE = os.path.join(os.path.dirname(__file__), "last_ytdlprefresh.txt")
REFRESH_INTERVAL = timedelta(days=1)
UVX_EXPECTED_PATH = os.path.expanduser("~/.cargo/bin/uvx")


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


class YtdlpInput(Schema):
    url = String(required=True, description="The URL of the video to download.")
    args = String(required=True, description="Command line arguments for yt-dlp.")

@app.post("/ytdlp")
@app.input(YtdlpInput, location="json")
def download_via_ytdlp(json_data):
    """
    Downloads a video using yt-dlp via uvx.
    Accepts a URL and yt-dlp arguments.
    """
    url = json_data["url"]

    download_dir = app.config.get("download_dir", None)  # Get download_dir from config
    logger.info(f"download dir is: {download_dir}")

    yt_dlp_args_str = json_data["args"]

    logger.info(f"Received request for URL: {url} with args: {yt_dlp_args_str}")

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
        parsed_yt_dlp_args = shlex.split(yt_dlp_args_str)
    except ValueError as e:
        logger.error(f"Error splitting yt-dlp arguments '{yt_dlp_args_str}': {e}")
        return (
            f"Error: Invalid yt-dlp arguments format: {e}",
            400,
            {"Content-Type": "text/plain"},
        )

    full_command = uvx_command_parts + ["yt-dlp"] + parsed_yt_dlp_args + [url]
    if download_dir:
        full_command = (
            uvx_command_parts
            + ["yt-dlp", "-k", "-o", f"{download_dir}/%(title)s.%(ext)s"]
            + parsed_yt_dlp_args
            + [url]
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
                f"yt-dlp process for {url} exited with code {process.returncode}. stderr: {process.stderr[:500]}"
            )
        logger.info(f"Successfully processed URL: {url}")
        return output_log, 200, {"Content-Type": "text/plain"}
    # No longer need FileNotFoundError here as we explicitly check UVX_EXPECTED_PATH
    except Exception as e:
        logger.exception(f"An unexpected error occurred while processing {url}: {e}")
        return f"Server Error: {str(e)}", 500, {"Content-Type": "text/plain"}


@app.get("/downloaded/<path:filename>")
def get_downloaded_content(filename: str):
    # check for the filename in the config download_dir
    # and then stream it back to the caller
    download_dir = app.config.get("download_dir", None)
    if not download_dir:
        logger.warning("Download directory not configured.")
        return "Download directory not configured", 500, {"Content-Type": "text/plain"}

    full_path = os.path.join(download_dir, filename)

    # Basic security check: prevent directory traversal
    if not os.path.abspath(full_path).startswith(os.path.abspath(download_dir)):
        logger.warning(f"Attempted directory traversal: {filename}")
        return "Invalid filename", 400, {"Content-Type": "text/plain"}

    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        logger.warning(f"File not found: {full_path}")
        return "File not found", 404, {"Content-Type": "text/plain"}

    try:
        # Use send_file to stream the file
        from flask import send_file  # type: ignore

        logger.info(f"Serving file: {full_path}")
        return send_file(full_path)
    except Exception as e:
        logger.exception(f"Error serving file {full_path}: {e}")
        return (
            f"Server Error: Could not serve file: {str(e)}",
            500,
            {"Content-Type": "text/plain"},
        )


# --- API Route to list downloaded files ---
@app.get("/downloaded")
def get_downloaded():
    download_dir = app.config.get("download_dir", None)
    if not download_dir or not os.path.isdir(download_dir):
        logger.warning(
            f"Download directory not configured or does not exist: {download_dir}"
        )
        return [], 200

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
        return files, 200
    except Exception as e:
        logger.exception(
            f"Error listing files in download directory {download_dir}: {e}"
        )
        return f"Server Error: Could not list files: {str(e)}", 500
