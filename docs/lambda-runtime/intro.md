---
sidebar_position: 1
slug: /
title: Loch Lambda Runtime
description: Run handlers written for AWS Lambda in plain Docker containers, with the AWS base images, behind a small static binary that implements the Runtime and Invoke APIs.
---

# Loch Lambda Runtime

Loch Lambda Runtime runs handlers written for AWS Lambda™ in plain Docker containers, unchanged, with the base images AWS publishes. It is an open-source alternative to the Runtime Interface Emulator (RIE) bundled in those base images. It contains no RIE code and knows nothing about the platform around it.

It is one static binary, `loch-lambda-runtime`, mounted read-only in the container at `/loch/lambda-runtime` and used as its entrypoint.

1. [Install the binary and run a first function](./install.md).
2. [Run it in production](./guides/production.md).
3. [Invoke the function](./guides/invoke.md) with curl, the AWS CLI or an AWS SDK.

## How it works

The binary is the container's PID 1. It starts the image's bootstrap (`/lambda-entrypoint.sh <handler>`) as a child process and sits between the bootstrap and the callers.

| Side | What it serves | Address |
|---|---|---|
| Bootstrap | The AWS Lambda Runtime API, version `2018-06-01` | `127.0.0.1:9001` (loopback only) |
| Callers | The AWS Lambda Invoke API: `POST /2015-03-31/functions/{name}/invocations` | `0.0.0.0:8080` |
| Probes | `/_loch/health`, `/_loch/metrics` (Prometheus) | port 8080, and `127.0.0.1:8081` for `health` |

`aws lambda invoke --endpoint-url` and the AWS SDKs work against port 8080.

## Features

| Feature | Behavior |
|---|---|
| Concurrency | One invocation at a time; the others wait in a bounded FIFO queue (16 invocations, 30 s at most). Full queue: 429 |
| Timeout | Enforced (`AWS_LAMBDA_FUNCTION_TIMEOUT`, 300 s by default), then the bootstrap is re-initialized |
| Errors | Reported as AWS Lambda reports them: `X-Amz-Function-Error: Unhandled` and the error body |
| Out of memory | Detected and reported as `Runtime.OutOfMemory` |
| Payloads | 6 MiB requests; a larger request gets 413. A response is never truncated |
| Logs | `START`, `END` and `REPORT` lines, in text or JSON (`AWS_LAMBDA_LOG_FORMAT=JSON`) |
| Authentication | Required by default: bearer token (stored as its SHA-256) or AWS SigV4 |
| Health and metrics | `/_loch/health`, `/_loch/metrics`, and a `health` subcommand for Docker healthchecks |

## Tested runtimes

The CI runs these images on amd64 and arm64:

| Runtime | Images |
|---|---|
| Node.js 22, 24, 26 | `mirror.gcr.io/amazon/aws-lambda-nodejs`; `public.ecr.aws/lambda/nodejs:22` |
| Python 3.12, 3.13, 3.14 | `mirror.gcr.io/amazon/aws-lambda-python`; `public.ecr.aws/lambda/python:3.13` |
| Custom runtime (`provided.al2023`) | `public.ecr.aws/lambda/provided:al2023` with a Go bootstrap (`aws-lambda-go`) |

Tested clients: curl with a bearer token, AWS CLI 2.39.5 (SigV4), AWS SDK v3 for JavaScript, and the `invoke` subcommand through `docker exec`. Java, .NET and Ruby images are not tested.

## Not supported

- Extensions and Telemetry APIs: layer extensions in `/opt/extensions` are not started.
- Response streaming to the client: streamed responses are buffered, then returned whole.
- SnapStart, X-Ray export, the `Lambda-Runtime-Invocation-Id` header.
- Asynchronous invocations (`X-Amz-Invocation-Type: Event`): answered with 400.
- `Max Memory Used` in `REPORT` is the container's peak since it started, not the invocation's.

## Differences from AWS Lambda

- One container runs one function, always warm: there is no scale-to-zero.
- No scaling: one container serves one invocation at a time.
- You run the container: Docker options, network and limits are yours to set.

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
