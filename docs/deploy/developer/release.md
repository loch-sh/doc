---
sidebar_position: 3
title: Release process
description: How a deploy-server release is built and published - GHCR image, binaries, SBOM and provenance attestations.
---

# Release process

Pushing a tag `v<major>.<minor>.<patch>[-suffix]` runs `.github/workflows/release.yml`: tests, `go vet` and `govulncheck`, then the image and the binaries.

```bash
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

## Artifacts

| Artifact | Details |
|---|---|
| Image `ghcr.io/loch-sh/deploy` | `linux/amd64` and `linux/arm64`; tags `v1.0.0`, `1.0`, `1`, `latest`. OCI labels and annotations, SBOM, SLSA provenance (`mode=max`) and a GitHub build provenance attestation pushed to the registry |
| `deploy-server_<tag>_linux_amd64.tar.gz`, `..._linux_arm64.tar.gz` | Static binary (`CGO_ENABLED=0`), `LICENSE`, `README.md`, `SECURITY.md`, `docker-compose.example.yml`, `examples/`. Each with a `.sha256` file and a provenance attestation, attached to the GitHub Release |

A prerelease tag (`v1.1.0-rc1`) is published under its own tag only: `latest`, `1.1` and `1` do not move, and the GitHub Release is marked as prerelease. Release notes are generated from the merged pull requests.

## Verify

```bash
sha256sum -c deploy-server_v1.0.0_linux_amd64.tar.gz.sha256
gh attestation verify deploy-server_v1.0.0_linux_amd64.tar.gz --repo loch-sh/deploy
gh attestation verify oci://ghcr.io/loch-sh/deploy:v1.0.0 --repo loch-sh/deploy
```

## Good to know

- Actions are pinned to commit SHAs; Dependabot proposes weekly bumps of actions, Go modules and base images.
- The workflows need no secret: GHCR uses the workflow's `GITHUB_TOKEN`.
