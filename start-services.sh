#!/bin/bash

# Start lighttpd in the background
# The -D flag tells lighttpd not to daemonize, and logs go to stderr.
lighttpd -D -f /etc/lighttpd/lighttpd.conf &

# Activate backend virtual environment and start APIFlask
# Run on 0.0.0.0 to be accessible from outside the container (via mapped ports)
echo "Starting APIFlask backend on port 5000..."
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

cd /app/apiflask

uv venv
uv pip install -r requirements.txt

.venv/bin/apiflask -A app.py run --host=0.0.0.0 --port=5000
