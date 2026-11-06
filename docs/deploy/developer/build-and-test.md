---
sidebar_position: 2
title: Build and test
description: Build deploy-server and its container image from source and run the test suite.
---

# Build and test

:::note
Requires Go 1.27.3 or later (the `go` directive of `go.mod`; `GOTOOLCHAIN=auto` fetches it). Docker with buildx is needed for the image.
:::

## Build

```bash
git clone https://github.com/loch-sh/deploy.git && cd deploy
CGO_ENABLED=0 go build -trimpath -ldflags="-s -w -X main.version=dev" -o deploy-server .
./deploy-server -version
```

## Test

```bash
go test -race -cover ./...
```

The suite needs neither Docker nor GitLab: `internal/testutil` provides a fake `docker` binary (first in `PATH`, records its arguments, prints fixtures for `docker ps` and `docker inspect`) and a fake GitLab OIDC issuer (discovery, JWKS, RS256 tokens). Every package is kept at 80 % coverage or more.

CI (`.github/workflows/ci.yml`) runs on pushes to `main` and on pull requests: `gofmt`, `go vet`, `go test -race`, `govulncheck`, then a `linux/amd64` image build that is not pushed.

## Docker image

```bash
docker build --build-arg VERSION=dev -t deploy-server:dev .
```

| Build argument | Effect |
|---|---|
| `VERSION` | Embedded version, shown by `-version` and the `deploy-server starting` log. Default `dev` |
| `TARGETARCH` | Set by `docker buildx` for `linux/amd64` and `linux/arm64` |

The runtime image is Alpine 3.24.3 with the docker CLI and the Compose plugin copied from `docker:29.9.2-cli`; buildx is not installed. Every base image is pinned by tag and digest. To bump one, update the tag and refresh the digest:

```bash
docker buildx imagetools inspect <image>:<tag> --format '{{json .Manifest.Digest}}'
```
