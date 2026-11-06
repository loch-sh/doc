---
sidebar_position: 4
title: Custom runtimes and images
description: Run a Go bootstrap on provided.al2023, pass any image's command after --, or build an image that contains the runtime.
---

# Custom runtimes and images

The runtime starts whatever command runs the function. By default it is the AWS base images' entry script: `index.handler` means `/lambda-entrypoint.sh index.handler`. Pass any other command after `--`.

## A Go bootstrap on provided.al2023

On `provided.al2023`, the function is an executable named `bootstrap` in `/var/task`. With `aws-lambda-go`:

1. Build a static binary for the image's architecture, and make it readable and executable by everyone:

   ```bash
   CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o fn/bootstrap .
   chmod 0755 fn/bootstrap
   ```

2. Run it. The handler argument is required by `/lambda-entrypoint.sh` but ignored by Go: use `bootstrap`.

   ```bash
   docker run -d --name fn --read-only --user 10001:10001 --cap-drop ALL \
     -v "$PWD/loch-lambda-runtime-linux-arm64:/loch/lambda-runtime:ro" \
     -v "$PWD/fn:/var/task:ro" \
     --env-file fn.env \
     --entrypoint /loch/lambda-runtime \
     public.ecr.aws/lambda/provided:al2023 bootstrap
   ```

`-- ./bootstrap` works too: the command is resolved from the working directory, `/var/task`.

| Problem | Cause |
|---|---|
| `Runtime.InvalidEntrypoint`, `no bootstrap found at /var/task/bootstrap or /opt/bootstrap` | No `bootstrap` file |
| `Runtime.InvalidEntrypoint`, `failed to exec /var/task/bootstrap` | Not executable or not readable by the container user, or wrong architecture (reason on stderr) |
| `Runtime.ExitError` | The bootstrap exited during init |

In each case `health` fails, every invocation answers with that error, and the init is retried.

## Any image: pass the command after `--`

For an image that does not use `/lambda-entrypoint.sh`, put the image's ENTRYPOINT and CMD after `--`:

```bash
docker image inspect --format '{{json .Config.Entrypoint}} {{json .Config.Cmd}}' my-function:latest
docker run … --entrypoint /loch/lambda-runtime my-function:latest -- <entrypoint> <cmd...>
```

Only the AWS base images are tested in CI.

## Build an image

You can copy the binary into an image instead of mounting it. This variant is not tested in CI. `COPY --chmod` needs BuildKit (the default since Docker 23).

```dockerfile
FROM public.ecr.aws/lambda/nodejs:22
COPY --chmod=0755 loch-lambda-runtime-linux-amd64 /loch/lambda-runtime
COPY index.js /var/task/
ENTRYPOINT ["/loch/lambda-runtime"]
CMD ["index.handler"]
```

Run it with the same options as in [Run in production](./production.md), without the `-v` of the binary and `--entrypoint`.

## Good to know

- Docker Desktop on macOS does not enforce file owners on bind mounts: a `0700` bootstrap runs there and fails on Linux. Use `0755`.
- A binary for the wrong architecture fails with `Exec format error`, unless Docker emulates that architecture.
- `/var/task` is read-only: write to `/tmp` only.
- Use `/loch/lambda-runtime`, outside `/opt`: `/opt` is the layers' directory (the `provided.al2023` bootstrap looks for `/opt/bootstrap` there).

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
