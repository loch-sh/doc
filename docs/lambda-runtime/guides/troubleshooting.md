---
sidebar_position: 6
title: Troubleshooting
description: Fix the common problems - refused startup, 403 behind a proxy, refused credential files, failing healthchecks, bootstraps that do not start.
---

# Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Startup fails: `authentication is on: set LOCH_RUNTIME_TOKEN_SHA256 …` | No credential. Set one ([Authentication](./authentication.md)). `LOCH_RUNTIME_AUTH=off` is for local development only |
| Startup fails with a message naming a setting (exit code 2) | Invalid value. Every invalid setting is listed at once |
| A handler named `health`, `invoke` or `version` runs the subcommand | Add `run`: `loch-lambda-runtime run health` |
| 403 `AccessDeniedException` behind a reverse proxy | The proxy forwards the browser's `Origin`. Strip the header at the proxy, or set `LOCH_RUNTIME_ALLOW_BROWSER=true` |
| A credential file is refused | The runtime's user could change it. Mount the whole path read-only (`:ro`, Docker secrets), or give it to another user. As root on a writable rootfs, it is always refused: run as non-root |
| Healthcheck written with `CMD-SHELL` or `docker run --health-cmd` | Use the exec form `["CMD", "/loch/lambda-runtime", "health"]`, never `CMD-SHELL`: a shell would hold the container's environment in a process the function can read |
| `docker exec … invoke --watch-stdin` exits 1, or waits for the event | Keep stdin open (`docker exec -i`) until the result arrives: its closing means the caller is gone. End the event with a newline: a number, `true` or `null` only ends at the next byte |
| provided.al2023: `failed to exec /var/task/bootstrap` | Set mode `0755` and build for the image's architecture. Docker Desktop on macOS does not enforce owners on bind mounts: `0700` passes there, fails on Linux |
| `docker pull` from `mirror.gcr.io` answers "not found" or 429 | First pulls of a tag can fail: retry |
| Invocations get 429 | The queue is full (`LOCH_RUNTIME_QUEUE_SIZE`, `LOCH_RUNTIME_QUEUE_BYTES`) or an invocation waited longer than `LOCH_RUNTIME_QUEUE_TIMEOUT`. Clients should retry after `Retry-After` |
| Invocations get 400 with `Event` | Asynchronous invocations are not supported |
| `REPORT` shows a growing `Max Memory Used` | It is the container's peak since it started, not the invocation's |

## Good to know

- Run with `LOCH_RUNTIME_LOG_LEVEL=debug` to see more of the runtime's own logs.
- Check the state: `docker exec fn /loch/lambda-runtime health` prints the health document.

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
