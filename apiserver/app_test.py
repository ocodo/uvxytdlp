# app_test.py
import pytest
from pathlib import Path
import os
import shutil
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from app import app

@pytest.fixture
def sync_test_client():
    """Provides a synchronous TestClient for testing synchronous routes."""
    with TestClient(app=app) as client:
         yield client

@pytest.fixture
async def async_test_client():
    """Provides an asynchronous AsyncClient for testing async routes."""
    # AsyncClient must be used in an async context
    # For httpx.AsyncClient, pass the app instance to base_url for local testing.
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

@pytest.fixture(autouse=True)
def mock_uvx_path(monkeypatch, tmp_path):
    """
    Mocks UVX_EXPECTED_PATH to a temporary, executable script that mimics
    realistic uvx yt-dlp output (stdout and stderr) and file creation.
    """
    mock_uvx_exec = tmp_path / "mock_uvx_exec"
    mock_uvx_exec.touch()
    os.chmod(mock_uvx_exec, 0o755) # Make the mock script executable

    simulated_filename = "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster) [dQw4w9WgXcQ].mp4"

    mock_script_content = f"""#!/bin/bash
# Mock script outputting to stdout and stderr, and creating a dummy file.
# The actual download_dir is set by temp_download_dir fixture in the test environment.
# We hardcode the filename that the mock script will "download" to.
DOWNLOAD_DIR="{tmp_path}/downloads"
mkdir -p "$DOWNLOAD_DIR" # Ensure the directory exists for the mock script

echo "[youtube] Extracting URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
echo "[youtube] dQw4w9WgXcQ: Downloading webpage"
echo "[download] Destination: $DOWNLOAD_DIR/{simulated_filename}"
echo "[download]   0.0% of   76.69MiB at   Unknown B/s ETA Unknown"
echo "[download]   5.2% of   76.69MiB at    50.15MiB/s ETA 00:01"
echo "[download]  12.5% of   76.69MiB at   Unknown B/s ETA Unknown"
echo "[download] 100% of   76.69MiB in 00:00:01 at 45.84MiB/s"
echo "[download] Destination: $DOWNLOAD_DIR/{simulated_filename.replace('.mp4', '.f140.m4a')}"
echo "[download]   0.0% of    3.29MiB at   Unknown B/s ETA Unknown"
echo "100.0% of    3.29MiB at    46.92MiB/s ETA 00:00"
echo "100% of    3.29MiB in 00:00:00 at 30.22MiB/s"
echo "[Merger] Merging formats into \\"$DOWNLOAD_DIR/{simulated_filename}\\""
echo "--- yt-dlp process finished successfully ---"
# Create the dummy file with some content to satisfy size check
echo "dummy file content" > "$DOWNLOAD_DIR/{simulated_filename}"
echo "Installed 1 package in 21ms" >&2 # Simulate stderr
exit 0
"""
    mock_uvx_exec.write_text(mock_script_content)

    # Monkeypatch UVX_EXPECTED_PATH in the app to point to our mock executable
    monkeypatch.setattr("app.UVX_EXPECTED_PATH", str(mock_uvx_exec))


@pytest.fixture(autouse=True)
def temp_download_dir(monkeypatch, tmp_path):
    """Uses a temporary directory for downloads for test isolation."""
    temp_dir = tmp_path / "downloads"
    temp_dir.mkdir()
    monkeypatch.setattr("app.download_dir", str(temp_dir))
    yield temp_dir # Yield the Path object for assertions
    shutil.rmtree(str(temp_dir), ignore_errors=True)

@pytest.fixture(autouse=True)
def temp_last_refresh_file(monkeypatch, tmp_path):
    """Uses a temporary file for last_ytdlprefresh.txt for test isolation."""
    temp_file = tmp_path / "last_ytdlprefresh.txt"
    temp_file.touch() # Ensure the file exists for app.py to attempt reading
    monkeypatch.setattr("app.LAST_REFRESH_FILE", str(temp_file))

def test_health_check(sync_test_client):
    """
    Tests the /health endpoint to ensure the API is running.
    """
    response = sync_test_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_ytdlp_e2e_success(async_test_client, temp_download_dir):
    """
    Tests the /ytdlp endpoint with a successful download scenario,
    mimicking the curl command and ensuring streaming output and file creation.
    """
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    # Arguments do not need to perfectly match real yt-dlp args, as uvx is mocked.
    # But they must be valid for shlex.split in app.py.
    args = "-f bestaudio --extract-audio --audio-format mp3 --audio-quality 0"

    response = await async_test_client.get(f"/ytdlp?url={url}&args={args}")

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/plain; charset=utf-8"

    output = ""
    test_chunk = ""
    async for chunk in response.aiter_text():
        test_chunk = chunk if test_chunk == "" else test_chunk
        output += chunk

    # Assert that the output contains expected strings from the mock script
    assert test_chunk in output
    assert test_chunk != output
    assert "--- STDOUT ---" in output
    assert "[youtube] Extracting URL:" in output
    assert "[download] 100% of   76.69MiB" in output
    assert "[Merger] Merging formats into" in output
    assert "--- yt-dlp process finished successfully ---" in output
    assert "--- STDERR ---" in output # Now we expect stderr header
    assert "Installed 1 package in 21ms" in output # From simulated stderr

    # Check that a file was "downloaded" into the temporary directory by the mock script
    simulated_filename = "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster) [dQw4w9WgXcQ].mp4"
    downloaded_file_path = temp_download_dir / simulated_filename
    assert downloaded_file_path.is_file()
    assert downloaded_file_path.name == simulated_filename
    assert os.path.getsize(str(downloaded_file_path)) > 0

@pytest.mark.asyncio
async def test_ytdlp_live_streaming(async_test_client: AsyncClient, temp_download_dir: Path):
    """
    Tests the /ytdlp endpoint with a LIVE YouTube URL to verify actual streaming behavior.
    This test does NOT mock the uvx/yt-dlp process.
    """
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    args = "--newline --progress-delta=0.05"

    response = await async_test_client.get(f"/ytdlp?url={url}&args={args}")

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/plain; charset=utf-8"

    output = ""
    first_chunk = "" # <- capture the first chunk
    chunk_count = 0

    # Iterate over the streaming response to collect chunks
    async for chunk in response.aiter_text():
        if not first_chunk:
            first_chunk = chunk  # <- capture the very first chunk received
        output += chunk
        chunk_count += 1

    # Assert that multiple chunks were received, confirming streaming
    assert chunk_count > 1, f"Expected multiple chunks for streaming, but received only {chunk_count} chunk(s)."
    # Assert that the first chunk is not the entire response
    assert first_chunk != output, "The first chunk should not be the entire response; streaming did not occur."

    # Assert key strings from typical yt-dlp output to confirm successful operation
    assert "--- STDOUT ---" in output
    assert "[download]" in output # <- Expect download progress lines
    assert "--- yt-dlp process finished successfully ---" in output
    assert "--- STDERR ---" in output # <- Expect stderr section, even if empty

    # Verify that a file was downloaded into the temporary directory
    downloaded_files = [f for f in temp_download_dir.iterdir() if f.is_file()]
    assert len(downloaded_files) >= 1, "Expected at least one file to be downloaded by yt-dlp."
    assert downloaded_files[0].stat().st_size > 0, "Downloaded file should not be empty."

    # The `temp_download_dir` fixture handles cleanup of the directory.
