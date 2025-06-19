#!/bin/sh

# Start lighttpd in the background
# The -D flag tells lighttpd not to daemonize, and logs go to stderr.
lighttpd -D -f /etc/lighttpd/lighttpd.conf &

# Activate backend virtual environment and start APIFlask
# Run on 0.0.0.0 to be accessible from outside the container (via mapped ports)
echo "Starting APIFlask backend on port 3000..."
cd /app/apiflask
./.venv/bin/apiflask run -A app.py -p 3000 -h 0.0.0.0

# The apiflask run command will keep the script (and container) running.
