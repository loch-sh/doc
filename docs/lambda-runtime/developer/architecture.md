---
sidebar_position: 1
title: Architecture
description: The layout of the Loch Lambda Runtime source code and the role of each package.
---

# Architecture

Loch Lambda Runtime is a Go module (`github.com/loch-sh/lambda-runtime`) with no dependency outside the standard library. Source: [github.com/loch-sh/lambda-runtime](https://github.com/loch-sh/lambda-runtime).

## Layout

| Path | Role |
|---|---|
| `cmd/loch-lambda-runtime` | `main`: makes the process non-dumpable first, then dispatches the subcommand |
| `internal/app` | Wires the components into the subcommands (`run`, `health`), the connection limits and the credential reload |
| `internal/config` | Parses and validates the command line, the `LOCH_RUNTIME_*` settings, the function variables and the bootstrap environment |
| `internal/engine` | Runs the bootstrap and feeds it one invocation at a time: init, timeouts, outcomes, re-init, shutdown |
| `internal/runtimeapi` | The AWS Lambda™ Runtime API (`2018-06-01`) served to the bootstrap |
| `internal/invokeapi` | The Invoke API, health and metrics endpoints, browser filter, per-IP caps, error shapes |
| `internal/auth` | Bearer and SigV4 authentication, credential files and their checks |
| `internal/queue` | The bounded FIFO of waiting invocations |
| `internal/process` | Starts the bootstrap as a child process, PID 1 duties |
| `internal/cgroup` | Reads the container's own cgroup (memory limit, peak, OOM kills) |
| `internal/logs` | Relays the bootstrap output, writes the platform lines, keeps log tails |
| `internal/metrics` | Collects figures and writes the Prometheus format |
| `internal/invokecli` | The `invoke` subcommand |
| `internal/ids`, `internal/netutil` | Request and trace ids; networking helpers |
| `internal/release` | Tests of the release tooling (the Makefile) |
| `integration/` | Integration tests against the real AWS images, under Docker |

## Request flow

1. A caller sends `POST /2015-03-31/functions/{name}/invocations` to `invokeapi`.
2. `invokeapi` filters browsers, applies the caps, authenticates, reads the body and queues the invocation.
3. `engine` pops it when the bootstrap asks `runtimeapi` for the next invocation.
4. The bootstrap posts the response or the error; `engine` decides the outcome (error, timeout, OOM, exit) and answers the caller.
5. `logs` writes `START`, `END` and `REPORT`; `metrics` counts the outcome.

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
