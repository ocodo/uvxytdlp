import pytest
from pathlib import Path
import httpx # This is the client type used by async_test_client

REAL_STREAMING_TEST_URL =

@pytest.mark.asyncio
async def test_ytdlp_live_streaming(async_test_client: httpx.AsyncClient, temp_download_dir: Path):
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
