---
sidebar_position: 4
title: Metrics reference
description: Every Prometheus metric served on /_loch/metrics, with its type and labels.
---

# Metrics reference

`GET /_loch/metrics` serves the Prometheus text format on the Invoke API port. It needs the credential, except from the loopback. With SigV4, sign the `GET` over an empty body. Labels only carry fixed values, never event contents or secrets.

| Metric | Type | Labels | Description |
|---|---|---|---|
| `loch_lambda_runtime_info` | gauge | `version` | Version of the runtime, always 1 |
| `loch_lambda_invocations_total` | counter | `outcome`: `success`, `error`, `timeout`, `exit`, `oom`, `too_large`, `init_error`, `throttled` | Invocations by outcome. `throttled` counts the 429 answers |
| `loch_lambda_invocation_duration_seconds` | histogram | | Duration of the invocations run by the bootstrap, buckets from 1 ms to 15 min |
| `loch_lambda_auth_failures_total` | counter | | Requests refused for their credential |
| `loch_lambda_inits_total` | counter | `result`: `success`, `failure` | Inits of the bootstrap |
| `loch_lambda_init_duration_seconds` | histogram | | Duration of the inits |
| `loch_lambda_queue_depth` | gauge | | Invocations waiting |
| `loch_lambda_queue_depth_max` | gauge | | Highest number of invocations waiting since start |
| `loch_lambda_memory_peak_bytes` | gauge | | Peak memory of the container (cgroup `memory.peak`); absent when not readable |
| `loch_lambda_state` | gauge | `state`: `initializing`, `ready`, `error`, `stopping` | 1 for the current state, 0 for the others |

Every `outcome` and `state` value is exposed from the start, at 0.

Example alert: `increase(loch_lambda_invocations_total{outcome=~"timeout|oom"}[5m]) > 0`.

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
