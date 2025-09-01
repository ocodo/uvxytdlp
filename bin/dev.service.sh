#!/bin/bash

# DEV Mode for Vite & FastAPI pair

PROOT=$(git rev-parse --show-toplevel)
VITE_LOG=$PROOT/vite-dev.log
FASTAPI_LOG=$PROOT/fastapi-dev.log

FASTAPI_PORT=${1:-5150}

cd apiserver
. .venv/bin/activate
.venv/bin/fastapi dev --port $FASTAPI_PORT --host 0.0.0.0 &
FASTAPI_PID=$!

cd ..
eval $($HOME/.local/share/fnm/fnm env --shell bash)
vite build --watch &
VITE_PID=$!

function cleanup {
    kill "$FASTAPI_PID"
    kill "$VITE_PID"
    wait "$FASTAPI_PID" "$VITE_PID"
    exit 0
}

trap cleanup SIGTERM SIGINT
wait -n
exit $?
