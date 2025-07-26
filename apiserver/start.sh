#!/bin/bash

fastapi run &

FASTAPI_PID=$!

function cleanup {
  kill "$FASTAPI_PID"
  wait "$FASTAPI_PID"
  exit 0
}

trap cleanup SIGTERM SIGINT

wait -n

exit $?
