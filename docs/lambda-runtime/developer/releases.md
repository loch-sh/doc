---
sidebar_position: 3
title: Releases
description: How a release is built reproducibly, described by an SBOM, signed with cosign and attested by GitHub.
---

# Releases

A release is two static binaries (`linux/amd64`, `linux/arm64`), one CycloneDX SBOM per binary, `SHA256SUMS` over these four files, and a cosign signature of `SHA256SUMS`. To verify one, see [Install](../install.md#download-and-verify).

## Reproducible build

Two builds of the same tree and version give the same bytes.

- Exact toolchain: `GOTOOLCHAIN=go1.27.3`.
- `CGO_ENABLED=0`, `GOAMD64=v1`, `GOARM64=v8.0`, an empty `GOFLAGS`, `-trimpath`, `-buildvcs=false`, `-ldflags '-s -w -buildid= -X main.version=<VERSION>'`: no path, build id, VCS stamp or date in the binary.
- Module sums checked against `sum.golang.org`.

Check it:

```bash
make reproducible VERSION=v1.0.1
```

## SBOM

`make sbom` runs syft (pinned by digest, without network) on each binary and writes `<binary>.cdx.json`. Its serial number and timestamp are removed, so the SBOMs are reproducible too. The module version reads `UNKNOWN` in the SBOM, because of `-buildvcs=false`: the release version is in the file name.

## Signing and provenance

On a `vX.Y.Z` tag, GitHub Actions builds the release, then:

- signs `SHA256SUMS` with cosign, keyless: a short-lived certificate from Fulcio for the workflow identity, logged in Rekor (`SHA256SUMS.cosign.bundle`);
- attests the build provenance of every file (`actions/attest-build-provenance`), binding it to the workflow, the commit and the tag;
- publishes the GitHub release after checking the checksums and the signature.

To accept every release of a major version, verify with an anchored regexp instead of the exact identity:

```bash
cosign verify-blob SHA256SUMS --bundle SHA256SUMS.cosign.bundle \
  --certificate-identity-regexp '^https://github\.com/loch-sh/lambda-runtime/\.github/workflows/ci\.yml@refs/tags/v1\.[0-9]+\.[0-9]+$' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

## Good to know

- `make release` refuses a version that is not `vX.Y.Z[-suffix]`, uncommitted or untracked files, and a HEAD not tagged with the version.
- A tag whose commit is not on `main` is refused by the CI.

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
