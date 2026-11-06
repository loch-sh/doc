---
sidebar_position: 1
slug: /
title: Loch Deploy
description: Loch Deploy is a minimal HTTP server that lets GitLab CI pipelines deploy docker compose stacks with a short-lived OIDC token instead of SSH.
---

# Loch Deploy

Loch Deploy replaces SSH-based deployment from GitLab CI. Pipelines authenticate with a short-lived GitLab OIDC ID token and send scoped HTTP requests; the server runs `docker compose` on the host Docker daemon. There is no long-lived secret and no shell access.

The server program is `deploy-server` (binary name, Go module and OCI image title), published from [github.com/loch-sh/deploy](https://github.com/loch-sh/deploy) as the image `ghcr.io/loch-sh/deploy`.

## How it works

1. A GitLab CI job requests an ID token with `id_tokens` and sends it as `Authorization: Bearer`.
2. The server verifies the token against the GitLab instance keys, then applies the IP allowlist, the namespace allowlist and the protected-environment rule.
3. It derives the target stack from the signed claims: `<project path slug>-<environment slug>`. The request never names the stack.
4. It checks the uploaded compose file against a deployment policy, then runs `docker compose pull` and `up`, pinned to that stack.

| Before (SSH) | With Loch Deploy |
|---|---|
| Runner opens an SSH session on the host | Runner sends HTTPS requests to four endpoints |
| Long-lived SSH key in CI variables | Per-job token, refused 10 minutes after issuance |
| `sudo` to create directories and run compose | `POST /directories`, `POST /deploy`, `POST /exec`, `DELETE /stack` |
| The job says which project and environment it is | Project and environment come from the signed token |
| Any compose file runs as is | The rendered compose model must pass the policy |

## What it protects against

- A pipeline acting on another project's stacks: identity comes from the token, ownership is recorded per GitLab `project_id`.
- A compose file taking over the host: `privileged`, `cap_add`, devices, host namespaces, `build`, external resources and bind mounts outside the stack's data directory are refused.
- A leaked token used later: tokens older than 10 minutes are refused.

## What it does not protect against

- A pipeline of an allowed project has full control of its own stacks: any image, any command through `/exec`, any environment name.
- The server runs as root with the Docker socket: a flaw in it is a root compromise of the host.
- Published ports, resource quotas and Traefik host names shared between stacks are not restricted.

Details and the full list of risks: [Security model](./admin/security.md).

## Requirements

| Item | Requirement |
|---|---|
| CI | GitLab 15.7 or later, with `id_tokens`. Other CI systems are not supported |
| Host | Docker; the image ships the docker CLI and the Compose plugin |
| Reverse proxy | TLS termination in front of the server (Traefik recommended). Port `8080` is never exposed |
| Compose | 2.23.1 or later to run the reference deployment (inline `configs.content`) |
| Paths | `/data/compose` and `/data/websites` mounted at the same path on the host and in the container |

## Next step

[Install Loch Deploy](./install.md), then [deploy from GitLab CI](./guides/gitlab-ci.md).
