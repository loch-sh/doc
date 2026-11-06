---
sidebar_position: 2
title: Authentication
description: Protect the Invoke API with a bearer token stored as its SHA-256, a plain token or AWS SigV4, and rotate credentials without a restart.
---

# Authentication

Network callers must authenticate. The runtime refuses to start without a credential, unless `LOCH_RUNTIME_AUTH=off` (local development only). Callers on the container's loopback (the function itself, `docker exec … invoke`, `health`) need none.

## Choose a credential

| Credential | Variables | Callers send | Readable by the function |
|---|---|---|---|
| Bearer token, as its SHA-256 (recommended) | `LOCH_RUNTIME_TOKEN_SHA256` (64 hex) or `LOCH_RUNTIME_TOKEN_SHA256_FILE` | `Authorization: Bearer <token>` | No: the token is never in the container |
| Plain bearer token | `LOCH_RUNTIME_TOKEN` or `LOCH_RUNTIME_TOKEN_FILE` (32 bytes at least, printable ASCII) | `Authorization: Bearer <token>` | Yes |
| AWS SigV4 key pair (optional) | `LOCH_RUNTIME_ACCESS_KEY` or `LOCH_RUNTIME_ACCESS_KEY_FILE` (`<access key id>:<secret>`) | A SigV4 signature (AWS CLI, AWS SDKs) | Yes |

Set one bearer source at most, and one source for the key pair. You can set a bearer token and a key pair together.

Create a token and its hash:

```bash
TOKEN=$(openssl rand -hex 32)
printf %s "$TOKEN" | openssl dgst -sha256 -r | cut -d' ' -f1   # value of LOCH_RUNTIME_TOKEN_SHA256
```

## Why the function can read some secrets

The function's code runs under the runtime's uid, in the same container. It can read the environment of processes started with `docker exec`, so a plain token is for standalone use only. SigV4 needs the secret itself to check signatures, so **the function can read its own SigV4 secret**. That only lets it invoke itself, which it can already do through the loopback. Never present that secret as protected from the function's code.

Generate the access key id at random and keep it private too.

## Use credential files

Mount the files read-only (Docker secrets, or a `:ro` bind mount):

```bash
docker run … \
  -v "$PWD/secrets:/run/fn-secrets:ro" \
  -e LOCH_RUNTIME_TOKEN_SHA256_FILE=/run/fn-secrets/token.sha256 \
  …
```

The function can send SIGHUP to the runtime, so the runtime refuses a file it could change. The file and every directory above it must be on a read-only mount, or belong to another user without being writable by the runtime. A world-writable file is refused. As root, the whole path, rootfs included, must be read-only: run as a non-root user.

## Rotate

The `*_FILE` variants are re-read on SIGHUP.

1. Write the complete new file next to the old one, then rename it over the old one.
2. Send SIGHUP: `docker kill --signal HUP fn`.

A reload that fails keeps the credentials in force: writing an invalid credential revokes nothing. To revoke, restart with new credentials. Variables are read once at startup, then removed from the runtime's environment.

## Good to know

- Never run with `--network host`: the loopback exemption assumes the container has its own network namespace.
- SigV4 requests can be replayed within the ±5 min clock skew, and the Invoke API is plain HTTP: expose it on private networks only.
- Requests from web browsers (`Origin`, `Sec-Fetch-Site`, `Sec-Fetch-Dest` or `Sec-Fetch-User` header) get 403, even with authentication off. `LOCH_RUNTIME_ALLOW_BROWSER=true` accepts them.
- `/_loch/health` needs no credential; `/_loch/metrics` does, except from the loopback.
- Threat model: [Security model](../reference/security-model.md).

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
