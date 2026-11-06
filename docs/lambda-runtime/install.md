---
sidebar_position: 2
title: Install
description: Download the loch-lambda-runtime binary, verify its signature and provenance, and run a first Node.js function with the AWS base image.
---

# Install

Loch Lambda Runtime ships as a static Linux binary on [GitHub Releases](https://github.com/loch-sh/lambda-runtime/releases). There is no Docker image: you mount the binary into the base image of your function (AWS Lambda™ base images, for example).

## Release files

| File | Content |
|---|---|
| `loch-lambda-runtime-linux-amd64` | Binary for x86-64 |
| `loch-lambda-runtime-linux-arm64` | Binary for ARM64 |
| `loch-lambda-runtime-linux-<arch>.cdx.json` | CycloneDX SBOM of each binary |
| `SHA256SUMS` | Checksums of the four files above |
| `SHA256SUMS.cosign.bundle` | Keyless cosign signature of `SHA256SUMS` |

## Download and verify

You need [cosign](https://docs.sigstore.dev/cosign/system_config/installation/) and, for the provenance check, the [GitHub CLI](https://cli.github.com/).

1. Download the binary for your architecture, the checksums and the signature:

   ```bash
   VERSION=v1.0.1
   ARCH=amd64   # or arm64
   BASE=https://github.com/loch-sh/lambda-runtime/releases/download/$VERSION
   curl -fLO "$BASE/loch-lambda-runtime-linux-$ARCH"
   curl -fLO "$BASE/SHA256SUMS"
   curl -fLO "$BASE/SHA256SUMS.cosign.bundle"
   ```

2. Verify the signature of `SHA256SUMS`. The identity binds it to the release workflow and to the tag:

   ```bash
   cosign verify-blob SHA256SUMS --bundle SHA256SUMS.cosign.bundle \
     --certificate-identity "https://github.com/loch-sh/lambda-runtime/.github/workflows/ci.yml@refs/tags/$VERSION" \
     --certificate-oidc-issuer https://token.actions.githubusercontent.com
   ```

3. Verify the checksum of the binary (`--ignore-missing`: you did not download every file):

   ```bash
   sha256sum -c --ignore-missing SHA256SUMS
   # macOS: shasum -a 256 -c --ignore-missing SHA256SUMS
   ```

4. Optional: verify the build provenance, which binds the binary to the commit and the tag that built it:

   ```bash
   gh attestation verify "loch-lambda-runtime-linux-$ARCH" --repo loch-sh/lambda-runtime
   ```

5. Make it executable. It runs as a non-root user in the container, so it must be readable and executable by others:

   ```bash
   chmod 0755 "loch-lambda-runtime-linux-$ARCH"
   ```

## Quick start

Run a Node.js function with the base image AWS publishes, the binary mounted as its entrypoint. Docker picks the image for your machine; `ARCH` must match it.

```bash
mkdir -p fn && echo 'exports.handler = async (event) => ({ hello: event.name ?? "world" });' > fn/index.js
ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/')

docker run --rm -p 127.0.0.1:8080:8080 \
  -v "$PWD/loch-lambda-runtime-linux-$ARCH:/loch/lambda-runtime:ro" \
  -v "$PWD/fn:/var/task:ro" \
  -e LOCH_RUNTIME_AUTH=off \
  --entrypoint /loch/lambda-runtime \
  public.ecr.aws/lambda/nodejs:22 index.handler
```

`index.handler` is the handler, as on AWS: the `handler` export of `index.js`. Invoke it from another terminal:

```bash
curl localhost:8080/2015-03-31/functions/function/invocations -d '{"name":"you"}'
# {"hello":"you"}
```

Or with the AWS CLI. With authentication off, the credentials are not checked, but the CLI needs some to sign:

```bash
AWS_ACCESS_KEY_ID=x AWS_SECRET_ACCESS_KEY=x AWS_DEFAULT_REGION=us-east-1 \
  aws lambda invoke --endpoint-url http://localhost:8080 --function-name function \
  --payload '{"name":"cli"}' --cli-binary-format raw-in-base64-out /dev/stdout
```

:::warning
`LOCH_RUNTIME_AUTH=off` is for this local try only. By default, the runtime refuses to start without a credential. See [Run in production](./guides/production.md).
:::

## Good to know

- `function` is the default function name. Set `AWS_LAMBDA_FUNCTION_NAME` to use another one in the URL.
- The binary does not depend on the image's libc or tools: it runs on any Linux base image.
- To add the binary to an image instead of mounting it, see [Custom runtimes and images](./guides/custom-runtimes.md#build-an-image).

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
