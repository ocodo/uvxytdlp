#!/bin/bash

fastapi run &
FASTAPI_PID=$!

lighttpd -D -f /etc/lighttpd/lighttpd.conf &
LIGHTTPD_PID=$!

function cleanup {
  kill "$FASTAPI_PID"
  kill "$LIGHTTPD_PID"
  wait "$FASTAPI_PID" "$LIGHTTPD_PID"
  exit 0
}

trap cleanup SIGTERM SIGINT

wait -n

exit $?
