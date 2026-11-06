---
sidebar_position: 2
title: Command line reference
description: The subcommands of loch-lambda-runtime (run, health, invoke, version), their options and exit codes.
---

# Command line reference

```text
loch-lambda-runtime [run] [flags] -- <command> [args...]
loch-lambda-runtime [run] [flags] <handler>     (= /lambda-entrypoint.sh <handler>)
loch-lambda-runtime health [flags]
loch-lambda-runtime invoke [flags] [--timeout <s>] [--log-tail] [--watch-stdin] < event.json
loch-lambda-runtime version
```

`-h` prints the usage and every flag. The `LOCH_RUNTIME_*` flags (`--queue-size`, …) are listed in the [Configuration reference](./configuration.md); `health` and `invoke` accept them too, to find the addresses and limits.

## run {#run}

The default subcommand: it runs the function and serves the APIs. It is the container's entrypoint.

| Form | Runs |
|---|---|
| `<handler>` | `/lambda-entrypoint.sh <handler>` (or `LOCH_RUNTIME_BOOTSTRAP`). One argument only |
| `-- <command> [args...]` | That command, for example the image's ENTRYPOINT and CMD |

```bash
loch-lambda-runtime --queue-size 32 index.handler
```

Write `run` explicitly when the handler is literally named `health`, `invoke` or `version`. Exit codes: 0 after a graceful stop (SIGTERM, SIGINT), 2 for an invalid command line or configuration.

## health {#health}

Queries the health listener on the loopback. Prints the health document; exits 0 when the function is ready, 1 otherwise. No credential needed.

```yaml
healthcheck:
  test: ["CMD", "/loch/lambda-runtime", "health"]
```

Use this exec form only, never `CMD-SHELL`.

## invoke {#invoke}

Reads one event on stdin (6 MiB at most, within 10 s), invokes the function through the loopback without credential, and prints one JSON envelope on stdout.

| Option | Description |
|---|---|
| `--timeout <s>` | Deadline of the whole call, queue wait included. Default: function timeout + `LOCH_RUNTIME_QUEUE_TIMEOUT` + 5 s |
| `--log-tail` | Fill `logTail` with the last 4 KB of the invocation logs |
| `--watch-stdin` | The event is the first JSON value on stdin, ended by a newline; stdin closing afterwards means the caller is gone |

```bash
echo '{"hello":"world"}' | docker exec -i fn /loch/lambda-runtime invoke --log-tail
```

| Envelope field | Content |
|---|---|
| `statusCode` | HTTP status of the Invoke API |
| `functionError` | `Unhandled` on a function error, empty otherwise |
| `requestId` | Request id of the invocation |
| `durationMs` | Duration of the call |
| `payload` | Response body, base64 |
| `logTail` | Logs, base64; empty when not requested |

Exit codes: 0 delivered (whatever the function returned), 1 transport error, deadline or caller gone, 2 unusable event.

`docker exec` cannot be killed by Docker and keeps the process's stdout open when the client leaves, but closes its stdin. With `--watch-stdin`, keep stdin open until the result: `invoke` ends within a second once it closes.

## version {#version}

Prints the version of the binary.

```bash
docker exec fn /loch/lambda-runtime version
```

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
