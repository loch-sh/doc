---
sidebar_position: 1
title: Run in production
description: Run a function with credentials, a read-only non-root container, resource limits and a Docker healthcheck.
---

# Run in production

A production container has a credential, runs read-only as a non-root user without capabilities, has memory, CPU and process limits, and a healthcheck. The binary and the function code are mounted read-only.

## 1. Create the credentials

Only the SHA-256 of the bearer token enters the container. Give the token itself to the callers.

```bash
TOKEN=$(openssl rand -hex 32)          # for the callers, never for the container
TOKEN_SHA256=$(printf %s "$TOKEN" | openssl dgst -sha256 -r | cut -d' ' -f1)
KEY_ID=$(LC_ALL=C tr -dc A-Z0-9 </dev/urandom | head -c 20)  # optional SigV4 pair
KEY_SECRET=$(openssl rand -base64 30)
printf 'LOCH_RUNTIME_TOKEN_SHA256=%s\nLOCH_RUNTIME_ACCESS_KEY=%s:%s\n' "$TOKEN_SHA256" "$KEY_ID" "$KEY_SECRET" > fn.env
chmod 600 fn.env
```

Keep both values secret. The SigV4 pair is only needed for the AWS CLI and SDKs. Details: [Authentication](./authentication.md).

## 2. Start the container

`fn/` holds the function code and `$ARCH` matches the host, as in the [quick start](../install.md#quick-start).

```bash
docker network create fn-net
docker run -d --name fn --network fn-net \
  --read-only --user 10001:10001 --cap-drop ALL --security-opt no-new-privileges:true \
  --tmpfs /tmp:size=64m --memory 256m --memory-swap 256m --cpus 0.5 --pids-limit 128 \
  -p 127.0.0.1:8080:8080 \
  -v "$PWD/loch-lambda-runtime-linux-$ARCH:/loch/lambda-runtime:ro" \
  -v "$PWD/fn:/var/task:ro" \
  --env-file fn.env -e AWS_LAMBDA_FUNCTION_TIMEOUT=30 \
  --entrypoint /loch/lambda-runtime \
  public.ecr.aws/lambda/nodejs:22 index.handler
until docker exec fn /loch/lambda-runtime health >/dev/null; do sleep 0.2; done
```

| Option | Why |
|---|---|
| `--read-only`, `--tmpfs /tmp` | The function writes to `/tmp` only, as on AWS Lambda™ |
| `--user 10001:10001` | Any non-root uid. As root, credential files are harder to protect |
| `--cap-drop ALL`, `no-new-privileges` | The runtime needs no capability |
| `--memory` = `--memory-swap` | No swap. The runtime reads the limit and sets `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` (256) |
| `--cpus`, `--pids-limit` | Bound what the function can use |
| `-p 127.0.0.1:8080:8080` | Publish on the loopback only, or not at all: callers on `fn-net` use `http://fn:8080` |

Invoke it: see [Invoke a function](./invoke.md).

## 3. Add a healthcheck

`docker run --health-cmd` only has the shell form, which you must not use. Use compose and the exec form:

```yaml
services:
  fn:
    image: public.ecr.aws/lambda/nodejs:22
    entrypoint: ["/loch/lambda-runtime"]
    command: ["index.handler"]
    user: "10001:10001"
    read_only: true
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    tmpfs: ["/tmp:size=64m"]
    mem_limit: 256m
    memswap_limit: 256m
    cpus: 0.5
    pids_limit: 128
    env_file: fn.env
    environment:
      AWS_LAMBDA_FUNCTION_TIMEOUT: "30"
    volumes:
      - ./loch-lambda-runtime-linux-amd64:/loch/lambda-runtime:ro  # or -linux-arm64
      - ./fn:/var/task:ro
    healthcheck:
      test: ["CMD", "/loch/lambda-runtime", "health"]
      interval: 10s
      timeout: 5s
```

This compose file applies the options above; it is not tested in CI. `health` exits 0 when the function is ready, 1 otherwise (initializing, init error, stopping).

## Limits

| Setting | Default | Effect |
|---|---|---|
| `AWS_LAMBDA_FUNCTION_TIMEOUT` | `300` (s) | Longer invocations are stopped and get `Sandbox.Timedout` |
| `LOCH_RUNTIME_QUEUE_SIZE` | `16` | Waiting invocations; beyond, 429 |
| `LOCH_RUNTIME_QUEUE_BYTES` | `min(32MiB, memory/8)` | Total size of the waiting invocations; beyond, 429 |
| `LOCH_RUNTIME_QUEUE_TIMEOUT` | `30s` | Longest wait in the queue; beyond, 429 |
| `LOCH_RUNTIME_MAX_PAYLOAD` | `6MiB` | Larger requests get 413 |
| `LOCH_RUNTIME_SHUTDOWN_GRACE` | `8s` | Time left to the running invocation on `docker stop` |

Full list: [Configuration reference](../reference/configuration.md).

## Good to know

- Never use `--network host`: the loopback needs no credential, so every process of the host could invoke the function.
- Keep `LOCH_RUNTIME_SHUTDOWN_GRACE` shorter than the container stop timeout (`stop_grace_period`, 10 s by default in Docker). On SIGTERM, queued invocations get 503.
- A tmpfs counts against the container memory limit.
- The Invoke API is plain HTTP: keep it on private networks.
- Never bill or alert on the function's logs: its code can forge `START`/`END`/`REPORT` lines. Use [metrics](./logs-and-metrics.md).

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
