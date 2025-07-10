#!/bin/bash 

cd apiserver
.venv/bin/fastapi dev --port 5150 &
FASTAPI_PID=$!

eval $(/home/jason/.local/share/fnm/fnm env --shell bash)

cd ..
vite --host 0.0.0.0 --port 5175 --config ___vite.config.ts &
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
