import os
import re
import glob
import asyncio
import shlex
import subprocess
import logging
import random
import json
from urllib.parse import unquote
from pathlib import Path
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Request, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from omegaconf import OmegaConf
from youtube_search import YoutubeSearch

app = FastAPI(
    title="API for uvxytdlp",
    version=" ineffable-idiocy",
    docs_url=None,
    redoc_url=None,
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

api = APIRouter()

# Configure basic logging for the application
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

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

def extract_filename_from_merger_log(target_line):
    """
    Extract the filename from a quoted path in the target line.
    Narrows it to the filename relative to download_dir.
    """
    match = re.search(r'"([^"]+)"', target_line)
    if not match:
        raise ValueError("No quoted path found in line")

    full_path = match.group(1)

    if download_dir not in full_path:
        raise ValueError("Download directory not found in path")

    relative_path = full_path.split(download_dir)[-1].lstrip(r"\/")
    filename = os.path.basename(relative_path)
    return filename


def squeeze_spaces(input_string):
    return re.sub(r"\s+", " ", input_string).strip()


def sanitize_filename_group(filename):
    """
    Renames the given filename and all its associated files (same base name, any extension)
    by replacing '#' and '&' with '.' in the base name.
    """
    base_name, _ = os.path.splitext(filename)

    # Special case: handle `.info.json` and similar multi-part extensions
    if filename.endswith(".info.json"):
        base_name = filename[: -len(".info.json")]

    cleaned_base = squeeze_spaces(
        base_name.replace("[", "")
        .replace("]", "")
        .replace("#", " ")
        .replace("&", " ")
        .replace("*", " ")
        .replace("_", " ")
    )

    # Scan download_dir for files starting with the same base name
    for f in os.listdir(download_dir):
        if f.startswith(base_name):
            old_path = os.path.join(download_dir, f)

            # Handle .info.json specially
            if f.endswith(".info.json"):
                ext = ".info.json"
            else:
                ext = os.path.splitext(f)[1]

            new_filename = f"{cleaned_base}{ext}"
            new_path = os.path.join(download_dir, new_filename)

            if old_path != new_path:
                os.rename(old_path, new_path)
                print(f"Renamed: {f} → {new_filename}")


def path_with_ext_exists(filename, ext):
    """
    find filename with the alternative extension,
    returns None or the new filename.
    """
    filename_ext = None
    filename_path = Path(filename)
    if filename_path.with_suffix(ext).exists():
        filename_ext = filename_path.with_suffix(ext)

    return filename_ext


def downloaded_files():
    files = []
    errors = []
    for entry in os.scandir(download_dir):
        _, ext = os.path.splitext(entry.name)
        is_file = entry.is_file()
        if is_file and ext.removeprefix(".") in visible_content:
            try:
                stat_info = entry.stat()
                entry_info = {
                    "name": entry.name,
                    "mtime": stat_info.st_mtime,
                    "ctime": stat_info.st_ctime,
                    "size": stat_info.st_size,
                }

                info_json_file = f'{Path(download_dir, Path(entry.name).stem)}.info.json'
                logger.info(f'info file: {info_json_file}')
                if Path(info_json_file).exists():
                    entry_info["info"] = f'{Path(info_json_file)}'
                    json_data = json.loads(Path(info_json_file).read_text(encoding='utf-8'))
                    entry_info["title"] = json_data.get('title')
                    entry_info["tags"] = json_data.get('tags')
                    entry_info["duration"] = json_data.get('duration_string')

                description_file = f'{Path(download_dir, Path(entry.name).stem)}.description'
                logger.info(f'description file: {description_file}')
                if Path(description_file).exists():
                    entry_info["description"] = Path(description_file).read_text(encoding='utf-8')

                files.append(entry_info)
            except Exception as e:
                logger.error(f"Error getting info for file {entry.name}: {e}")
                errors.append(e)

    # Sort by newest first
    files.sort(key=lambda f: f["mtime"], reverse=True)
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


async def _stream_subprocess_output(
    process: asyncio.subprocess.Process, url: str, command: str = ""
):
    """
    Asynchronously streams stdout and stderr from a given subprocess,
    adding appropriate headers and handling process completion and errors.
    """
    target_line: str = ""
    stderr_buffer = (
        b""  # Buffer for stderr to potentially display at the end or on error
    )
    try:
        # Stream stdout
        yield b"--- STDOUT ---\n"
        # yield command
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            if b"[Merger]" in line:
                target_line = line.decode()
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
            yield b"Checking filename for invalid chars..."
            yield f"target_line: {target_line}".encode("utf-8")
            if target_line:
                yt_filename = extract_filename_from_merger_log(target_line)
                sanitize_filename_group(yt_filename)

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


def cookies_filepath(domain):
    return os.path.join(download_dir, f"{domain}.cookies")


def valid_cookies(cookies: str):
    """Perform progressive checks on cookies to validate as Netscape Cookies"""
    if cookies.splitlines()[0] == "# Netscape HTTP Cookie File":
        return True


def write_ytcookies(cookies: str):
    """Writes the given cookies string to the yt.cookies file."""
    if cookies and valid_cookies(cookies):
        cookies_path = cookies_filepath("youtube.com")
        try:
            with open(cookies_path, "w", encoding="utf-8") as f:
                f.write(cookies)
            logger.info(f"Successfully wrote youtube cookies to {cookies_path}")
            return {"message": "Cookies saved successfully."}
        except Exception as e:
            logger.error(f"Failed to write youtube cookies to {cookies_path}: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to save cookies: {str(e)}"
            )
    else:
        raise HTTPException(
            status_code=400, detail="Unable to save empty or invalid cookies"
        )


def read_ytcookies():
    """Read and return the saved YouTube cookies"""
    cookies_path = cookies_filepath("youtube.com")
    logger.info(f"cookies_path: {cookies_path}")

    if not os.path.exists(cookies_path):
        return None

    try:
        cookies = None
        with open(cookies_path, "r", encoding="utf-8") as f:
            cookies = f.read()

        return cookies

    except Exception as e:
        logger.error(f"Failed to read youtube cookies from {cookies_path}: {e}")
        return None


class Cookies(BaseModel):
    cookies: str


@api.get("/ytsearch/{query}")
def search_youtube(query: str):
    """Search youtube return results"""
    return YoutubeSearch(query, max_results=48).to_dict()


@api.post("/ytcookies")
def save_ytcookies(payload: Cookies):
    """Saves the provided YouTube cookies to a file."""
    if read_ytcookies() == payload.cookies:
        return "", 304

    return write_ytcookies(payload.cookies), 201


@api.get("/ytcookies")
def get_ytcookies():
    """return the saved YouTube cookies"""
    cookies = read_ytcookies()
    if cookies:
        return {"cookies": cookies}

    return {"message": "No cookies found"}, 404


@api.get("/ytdlp")
async def download_via_ytdlp(url: str, args: str):
    global download_dir
    url = unquote(url)
    args = unquote(args)
    logger.info(f"download dir is: {download_dir}")
    logger.info(f"Received request for URL: {url} with args: {args}")

    # We expect uvx in path, or fail
    uvx_command_parts = ["uvx"]

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

    cookies_file = os.path.join(download_dir, "yt.cookies")
    if os.path.exists(cookies_file) and os.path.getsize(cookies_file) > 0:
        parsed_args.extend(["--cookies", cookies_file])

    full_command = (
        uvx_command_parts
        + ["yt-dlp", "-o", f"{download_dir}%(title)s.%(ext)s"]
        + ["--newline"]
        + ["--no-playlist"]
        + ["--write-thumbnail"]
        + ["--write-description"]
        + ["--write-info-json"]
        + ["--progress-delta=0.05"]
        + ["--progress-template", f"{get_ytdlp_progress_template()}"]
        + ["--no-mtime"]
        + parsed_args
        + [f"{url}"]
    )

    logger.info(
        f"Executing command: {' '.join(shlex.quote(part) for part in full_command)}"
    )

    full_command_str = " ".join(full_command)

    try:
        process = await asyncio.create_subprocess_exec(
            *full_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={**os.environ, "PYTHONUNBUFFERED": "1"},
        )

    except Exception as e:
        logging.exception(f"Failed to start process: {full_command_str}")
        raise HTTPException(status_code=500, detail=f"Failed to start process: {full_command} {e}")

    return StreamingResponse(
        _stream_subprocess_output(process, url, full_command_str),
        media_type="text/event-stream",
    )


def validate_file_path(filename: str, base_dir: str) -> str:
    full_path = os.path.realpath(os.path.join(base_dir, filename))
    base_dir_real = os.path.realpath(base_dir)

    if not full_path.startswith(base_dir_real + os.sep):
        raise ValueError("Invalid filename")

    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise FileNotFoundError("File not found")

    return full_path


def serve_file_from_dir(filename: str, base_dir: str, force_download: bool = False):
    try:
        full_path = validate_file_path(filename, base_dir)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except FileNotFoundError as fnfe:
        raise HTTPException(status_code=404, detail=str(fnfe))

    try:
        if force_download:
            return FileResponse(full_path, filename=os.path.basename(full_path))
        else:
            return FileResponse(full_path)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Server Error: Could not serve file: {str(e)}"
        )


@api.get("/assets/{filename:path}")
def get_content_assets(filename: str):
    """Get json list of asset files for given filename"""
    basename, ext = os.path.splitext(filename)
    path_basename = os.path.join(download_dir, basename)
    files = [
        p.replace(download_dir + os.sep, "") for p in glob.glob(f"{path_basename}*")
    ]
    return files


@api.get("/thumbnail/{filename:path}")
def get_thumbnail(filename: str):
    assets = get_content_assets(filename)
    extensions_to_filter = [".webp", ".png", ".jpg", ".jpeg"]
    images = [
        file
        for file in assets
        if any(file.lower().endswith(ext) for ext in extensions_to_filter)
    ]
    if len(images) > 0:
        return serve_file_from_dir(images[0], download_dir, force_download=False)
    raise HTTPException(
        status_code=404, detail=f"thumbnail not available for {filename}"
    )


@api.get("/download/{filename:path}")
def download_content(filename: str):
    return serve_file_from_dir(filename, download_dir, force_download=True)


@api.get("/downloaded/{filename:path}")
def get_downloaded_content(filename: str):
    return serve_file_from_dir(filename, download_dir, force_download=False)


@api.get("/downloaded")
def get_downloaded():
    try:
        files, errors = downloaded_files()
        return {
            "files": files,
            "errors": errors,
        }
    except Exception as e:
        logger.exception(
            f"Error listing files in download directory {download_dir}: {e}"
        )
        raise HTTPException(
            status_code=500, detail=f"Server Error: Could not list files: {str(e)}"
        )


@api.delete("/downloaded/{filename:path}")  # fmt: skip
def delete_downloaded_file(filename: str):
    """
    Deletes a specific media file from the download directory,
    and associated meta data / thumbnail(s)
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

        media_exts = [".mp3", ".mp4", ".m4a", ".mkv", ".webm"]
        exts = [".info.json", ".description", ".webp", ".png", ".jpeg", ".jpg"]

        other_media_files = any(
            path_with_ext_exists(full_path, ext) for ext in media_exts
        )

        if not other_media_files:
            for ext in exts:
                path_with_ext = path_with_ext_exists(full_path, ext)
                if path_with_ext:
                    os.remove(path_with_ext)

        logger.info(f"Successfully deleted file: {full_path}")
        return {"message": f"File '{filename}' deleted successfully."}
    except Exception as e:
        logger.exception(f"Error deleting file {full_path}: {e}")


@api.get("/random-image")
def get_random_image():
    image_dir = config.wallpapers or "/images"
    if os.path.exists(image_dir):
        image_files = [
            f
            for f in os.listdir(image_dir)
            if f.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".webp"))
        ]
        if not image_files:
            return {"info": "No images found in the specified path."}
        random_image = random.choice(image_files)
        image_path = os.path.join(image_dir, random_image)
        return FileResponse(image_path)
    return {"info": f"{image_dir} doesn't exist"}


@api.get("/health", tags=["api"])
@api.head("/health", tags=["api"])
def health_check():
    """
    A simple health check endpoint that confirms the API server is running.
    This is useful for container orchestration systems (like Docker Swarm or
    Kubernetes) and load balancers to verify service availability.
    """
    return {"status": "ok"}


@api.get("/docs", include_in_schema=False)
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
      apiDescriptionUrl="/api/openapi.json"
      router="hash"
    />

  </body>
</html>""")


app.include_router(api, prefix="/api", tags=["api"])
app.mount("/", StaticFiles(directory="dist", html=True), name="vite_dist")
