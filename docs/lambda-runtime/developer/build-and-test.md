---
sidebar_position: 2
title: Build and test
description: Build loch-lambda-runtime from source and run its unit and integration tests.
---

# Build and test

You need Go and make. The Makefile pins the toolchain (`GOTOOLCHAIN=go1.27.3`); the go command fetches it if needed. The integration tests and `make test-linux` need Docker.

## Build

```bash
git clone https://github.com/loch-sh/lambda-runtime.git
cd lambda-runtime
make binaries   # dist/loch-lambda-runtime-linux-amd64 and -arm64
```

## Make targets

| Target | What it does |
|---|---|
| `make build` | Binary for the current platform in `dist/loch-lambda-runtime` |
| `make binaries` | Static Linux binaries for amd64 and arm64 in `dist/` |
| `make vet` | `go vet`, also for Linux and the integration tests |
| `make test` | Unit tests with the race detector |
| `make test-linux` | Unit tests in a Linux container (process groups, `/proc`) |
| `make cover` | Coverage |
| `make integration` | Integration tests against the real AWS images |
| `make release VERSION=vX.Y.Z` | Binaries, SBOMs and `SHA256SUMS` |
| `make reproducible` | Two builds in two directories; fails unless the checksums match |

## Integration tests

`make integration` runs `go test -tags integration` against the AWS base images (Node.js, Python, `provided.al2023` with a Go bootstrap), under the production hardening: concurrent invocations, timeouts, errors, init errors, OOM, payload limits, SIGTERM, authentication with the AWS CLI and the AWS SDK for JavaScript. The CI runs them on amd64 and arm64.

The first pulls from `mirror.gcr.io` may answer "not found" or 429: the tests retry.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs gofmt, vet and unit tests, the reproducible build and the integration tests, on amd64 and arm64. Release tags also build, attest, sign and publish: see [Releases](./releases.md).

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
