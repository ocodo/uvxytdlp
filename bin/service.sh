#!/bin/bash

VITE_PORT=${1:-5175}
FASTAPI_PORT=${2:-5150}

cd apiserver
.venv/bin/fastapi dev --port $FASTAPI_PORT --host 0.0.0.0 &
FASTAPI_PID=$!

eval $(/home/jason/.local/share/fnm/fnm env --shell bash)

cd ..
vite --host 0.0.0.0 --port $VITE_PORT --config ___vite.config.ts &
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
