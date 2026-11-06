---
sidebar_position: 1
title: Configuration reference
description: Every LOCH_RUNTIME_* setting with its flag and default, the function variables, and the environment the bootstrap receives.
---

# Configuration reference

Every `LOCH_RUNTIME_*` setting is read from the environment or from its flag; the flag wins. The three variables that hold a credential value have no flag, so that it never shows in the process list. Every value is checked at startup: an invalid one stops the runtime (exit code 2) with a message naming the setting, all errors listed at once.

Durations accept Go syntax (`1m30s`) or seconds (`2.5`), up to 24 h. Sizes accept bytes or a `KiB`, `MiB` or `GiB` suffix. Switches accept `on`/`true` and `off`/`false`.

## Runtime settings {#runtime}

| Variable | Flag | Default | Description |
|---|---|---|---|
| `LOCH_RUNTIME_INVOKE_ADDR` | `--invoke-addr` | `0.0.0.0:8080` | Listen address of the Invoke API (IP and port) |
| `LOCH_RUNTIME_API_ADDR` | `--runtime-api-addr` | `127.0.0.1:9001` | Listen address of the Runtime API. Loopback IPv4 only |
| `LOCH_RUNTIME_HEALTH_ADDR` | `--health-addr` | `127.0.0.1:8081` | Health-only listener used by `health`. Loopback IPv4 only |
| `LOCH_RUNTIME_BOOTSTRAP` | `--bootstrap` | `/lambda-entrypoint.sh` | Program run with the handler in the `<handler>` form. Absolute path |
| `LOCH_RUNTIME_WORKDIR` | `--workdir` | current directory (the image `WORKDIR`) | Working directory of the bootstrap. Absolute path |
| `LOCH_RUNTIME_INIT_TIMEOUT` | `--init-timeout` | `10s` | Init budget. A longer init keeps running, and its time is charged to the first invocation's timeout |
| `LOCH_RUNTIME_SHUTDOWN_GRACE` | `--shutdown-grace` | `8s` | Time given to the running invocation on SIGTERM. `0` accepted |
| `LOCH_RUNTIME_MAX_PAYLOAD` | `--max-payload` | `6MiB` | Request limit, 1 KiB to 1 GiB. Responses: this limit + 100 bytes, as on AWS Lambda™ |
| `LOCH_RUNTIME_QUEUE_SIZE` | `--queue-size` | `16` | Waiting invocations (0 to 100000) |
| `LOCH_RUNTIME_QUEUE_BYTES` | `--queue-bytes` | `min(32MiB, memory/8)`, at least `LOCH_RUNTIME_MAX_PAYLOAD` | Total size of the invocations in memory. A set value below `LOCH_RUNTIME_MAX_PAYLOAD` is refused |
| `LOCH_RUNTIME_QUEUE_TIMEOUT` | `--queue-timeout` | `30s` | Longest wait in the queue; beyond, 429 |
| `LOCH_RUNTIME_MAX_CONNS` | `--max-conns` | 8 × (queue size + 1), at most 768 | Open connections to the Invoke API. One source IP may hold an eighth of them, at least 4 |
| `LOCH_RUNTIME_AUTH` | `--auth` | `on` | `off` disables authentication (development only) |
| `LOCH_RUNTIME_ALLOW_BROWSER` | `--allow-browser` | `false` | `true` accepts requests from web browsers (`Origin`, `Sec-Fetch-Site`, `Sec-Fetch-Dest`, `Sec-Fetch-User` headers) |
| `LOCH_RUNTIME_LOG_LEVEL` | `--log-level` | `info` | `debug`, `info`, `warn`, `error` |

## Credentials {#credentials}

Set one bearer source at most, and one source for the SigV4 pair. With authentication on, at least one credential is required. See [Authentication](../guides/authentication.md).

| Variable | Flag | Description |
|---|---|---|
| `LOCH_RUNTIME_TOKEN_SHA256` | none | Hex SHA-256 of the bearer token, 64 characters (recommended) |
| `LOCH_RUNTIME_TOKEN_SHA256_FILE` | `--token-sha256-file` | File holding it |
| `LOCH_RUNTIME_TOKEN` | none | Plain bearer token, 32 printable ASCII characters at least, no space (readable by the function) |
| `LOCH_RUNTIME_TOKEN_FILE` | `--token-file` | File holding the plain bearer token |
| `LOCH_RUNTIME_ACCESS_KEY` | none | `<access key id>:<secret>` for SigV4 (readable by the function) |
| `LOCH_RUNTIME_ACCESS_KEY_FILE` | `--access-key-file` | File holding `<access key id>:<secret>` |

Files: absolute paths, regular files of 4 KiB at most, re-read on SIGHUP, refused if the runtime's user could change them.

## Function variables {#function}

The function is configured with the AWS variables.

| Variable | Default | Description |
|---|---|---|
| `AWS_LAMBDA_FUNCTION_NAME` | `function` | Name accepted in the Invoke URL. 1 to 64 letters, digits, `-` or `_` |
| `AWS_LAMBDA_FUNCTION_VERSION` | `$LATEST` | Version reported to the function |
| `AWS_LAMBDA_FUNCTION_TIMEOUT` | `300` | Timeout in seconds, up to 86400. A convention of the RIE, not an AWS variable |
| `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` | the cgroup memory limit, else `3008` | Memory in MB, reported in `REPORT` and to the function |
| `AWS_REGION` | `AWS_DEFAULT_REGION`, else `us-east-1` | Region of the function ARN |
| `AWS_LAMBDA_LOG_FORMAT` | `Text` | `JSON` writes the platform log lines as JSON |

## Environment of the bootstrap {#child-env}

The bootstrap inherits the container's environment, with these changes:

| Variables | Change |
|---|---|
| `AWS_LAMBDA_RUNTIME_API` | Always set to the Runtime API address |
| `AWS_LAMBDA_MAX_CONCURRENCY` | Always removed, with a warning |
| `LOCH_RUNTIME_*` | Always removed |
| `AWS_LAMBDA_FUNCTION_NAME`, `AWS_LAMBDA_FUNCTION_VERSION`, `AWS_LAMBDA_FUNCTION_MEMORY_SIZE`, `AWS_LAMBDA_LOG_GROUP_NAME`, `AWS_LAMBDA_LOG_STREAM_NAME`, `AWS_REGION`, `AWS_DEFAULT_REGION`, `AWS_LAMBDA_INITIALIZATION_TYPE`, `AWS_XRAY_CONTEXT_MISSING`, `LAMBDA_TASK_ROOT`, `LAMBDA_RUNTIME_DIR` | Set when absent |

No credential is ever invented: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN` come from your environment only.

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
