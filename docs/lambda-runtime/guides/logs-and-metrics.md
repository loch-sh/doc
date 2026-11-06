---
sidebar_position: 5
title: Logs and metrics
description: Read the function's START, END and REPORT log lines, switch them to JSON, check health and scrape Prometheus metrics.
---

# Logs and metrics

## Logs

The function's stdout and stderr go to the container output, unbuffered. Around each invocation, the runtime writes the platform lines AWS Lambda™ writes:

```text
START RequestId: 3f2a… Version: $LATEST
END RequestId: 3f2a…
REPORT RequestId: 3f2a…	Duration: 12.34 ms	Billed Duration: 13 ms	Memory Size: 256 MB	Max Memory Used: 61 MB	
```

| Field | Content |
|---|---|
| `Init Duration` | On the first `REPORT` after an init |
| `Status: timeout` | The invocation timed out; a `Task timed out after N seconds` line comes before `END` |
| `Status: error`, `Error Type` | The invocation failed |
| `Max Memory Used` | The container's peak since it started, not the invocation's |

With `AWS_LAMBDA_LOG_FORMAT=JSON`, these lines become JSON records (`platform.start`, `platform.runtimeDone`, `platform.report`). The runtimes of the AWS images also format the application logs from this variable.

The runtime's own logs are JSON on stderr. Set their level with `LOCH_RUNTIME_LOG_LEVEL` (`debug`, `info`, `warn`, `error`). They never contain events or secrets.

```bash
docker logs -f fn
```

## Health

`GET /_loch/health` needs no credential. It answers 200 `{"status":"ready","queueDepth":0}` when the function is ready, 503 with `initializing`, `error` or `stopping` otherwise. In the container, `/loch/lambda-runtime health` checks it and exits 0 or 1.

## Metrics

`GET /_loch/metrics` returns Prometheus text. It needs the credential, except from the loopback.

```bash
curl -s -H "Authorization: Bearer $TOKEN" localhost:8080/_loch/metrics
```

Main series: `loch_lambda_invocations_total{outcome}`, `loch_lambda_invocation_duration_seconds`, `loch_lambda_queue_depth`, `loch_lambda_state{state}`. Full list: [Metrics reference](../reference/metrics.md).

## Good to know

- The function's code can print fake `START`, `END` or `REPORT` lines. Never derive billing or health from the logs: use the metrics, the `invoke` envelope or `/_loch/health`.
- The runtime does not rate-limit logs: bound their volume with the Docker log driver options (`max-size`, `max-file`).
- `X-Amz-Log-Type: Tail` (`--log-type Tail` in the AWS CLI) returns the last 4 KB of the invocation logs in `X-Amz-Log-Result`.

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
