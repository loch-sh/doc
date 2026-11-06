---
sidebar_position: 5
title: Security model
description: What the function's code, a network caller and a web page can and cannot do, and the protections that follow.
---

# Security model

The function's code is untrusted. It runs under the runtime's uid, in the same container, and the uids cannot be separated without capabilities. Hence the rule: **no usable secret in the container**.

## What the function's code can do

| Action | Consequence | Protection |
|---|---|---|
| Read the environment of `docker exec` processes (`/proc/<pid>/environ`) | A plain token or a SigV4 secret is readable | Use the bearer token as its SHA-256 (`LOCH_RUNTIME_TOKEN_SHA256`): the token never enters the container. The runtime is non-dumpable and removes credential variables from its own environment |
| Read its own SigV4 secret | It can invoke itself, which it already can through the loopback | Never present the SigV4 secret as protected from the function |
| Send SIGHUP to PID 1 | Credential files are re-read | Files the runtime's user could change are refused |
| Send SIGTERM, SIGQUIT, … to PID 1 | It stops its own container | Self-inflicted only |
| Lower its `oom_score_adj` (started at 1000) | An OOM may kill PID 1 instead of the bootstrap | Self-inflicted only |
| Forge `START`, `END`, `REPORT` lines | Logs cannot be trusted | Never bill or alert on logs: use `/_loch/metrics`, the `invoke` envelope or `/_loch/health` |
| Invoke itself through the loopback | No credential needed | Bound by the global connection cap |

A shell-form healthcheck (`CMD-SHELL`) leaves a shell holding the container's full environment: use the exec form.

## What a network caller can do without credential

| Action | Note |
|---|---|
| Read `/_loch/health` | State and queue depth only |
| Tell a valid access key id from a wrong one | As on AWS. Keep the access key id random and private |

Everything else answers 401 or 403. A bearer token is checked before the body is read; a SigV4 request is checked as far as possible before it, and its body has its own bounded budget until verified. Each source IP has its own connection and request caps, so one caller cannot take every slot.

## What a web page can do

Nothing: requests from a browser (`Origin`, `Sec-Fetch-Site`, `Sec-Fetch-Dest` or `Sec-Fetch-User` header) get 403, even with authentication off, which blocks CSRF and DNS rebinding. `LOCH_RUNTIME_ALLOW_BROWSER=true` lifts this. With authentication off, a page could still read `/_loch/metrics` through DNS rebinding.

## Limits of the model

- The loopback exemption assumes the container has its own network namespace: never use `--network host`.
- The Invoke API is plain HTTP, and a SigV4 request can be replayed within the ±5 min clock skew: expose it on private networks only.
- A credential reload that fails keeps the old credentials: to revoke, restart with new ones.

## Hardening

Run as a non-root uid, with a read-only rootfs, `--cap-drop ALL`, `no-new-privileges`, a tmpfs `/tmp`, a memory limit without swap, CPU and process limits. The binary writes nothing outside `/tmp`. See [Run in production](../guides/production.md).

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
