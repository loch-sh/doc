---
sidebar_position: 2
title: Build and test
description: Build the Loch S3 binaries and Docker image from source and run the test suite.
---

# Build and test

:::note
Requires a recent stable Rust toolchain (the crate uses edition 2024). Docker is needed for the image, [`cross`](https://github.com/cross-rs/cross) for Linux and Windows cross-builds.
:::

## Build

```bash
git clone https://github.com/loch-sh/s3.git && cd s3
cargo build --release
./target/release/s3
```

The build produces two binaries: `s3` (the server) and `loch-s3` (the user CLI).

## Test

```bash
cargo test                  # unit and integration tests
cargo test test_name        # one test
```

Integration tests in `tests/integration.rs` start a real server on a random port and call it with `reqwest`.

## Cross-builds

| Command | Target |
|---|---|
| `make linux-amd64` | `x86_64-unknown-linux-musl` |
| `make linux-arm64` | `aarch64-unknown-linux-musl` |
| `make windows-amd64` | `x86_64-pc-windows-gnu` |
| `make macos-amd64` | `x86_64-apple-darwin` (on macOS) |
| `make macos-arm64` | `aarch64-apple-darwin` (on macOS) |
| `make all` | All of the above |

The server binary lands in `dist/<platform>/`.

## Docker image

```bash
make docker                  # image for the local architecture
make docker-multiplatform    # amd64 + arm64, without push
```

## Releases

CI runs the tests on every branch and tag. A tag builds the release archives, publishes the GitHub release and pushes the multi-arch image to `ghcr.io/loch-sh/s3`.
