---
sidebar_position: 6.5
title: Functions module
description: Enable the Functions module, provide the Loch Lambda Runtime binary, set the limits and budgets, and understand the networks, egress and credentials of functions.
---

# Functions module

:::caution Work in progress
Functions are a work in progress: the API, the interface and the CLI exist, but the feature can still change. Runtime updates, external secret stores, public HTTP access and a per-function disk quota are not available yet.
:::

The Functions module runs handlers written for AWS Lambda™ (Node.js, Python, or a compiled `bootstrap`) on the Docker host, in the AWS Lambda base images published by AWS, with [Loch Lambda Runtime](/lambda-runtime/) as entrypoint. This page sets the module up. To create and run functions, see [Functions](../user-guide/functions.md).

:::note
Admin only. Requires `FUNCTIONS_ENABLED=true` and `HOSTING_STACKS_DIRECTORY` (the compose files go there, even when the Hosting module is off).
:::

## Enable the module

Add the variables to the API `.env`, then restart the API:

| Variable | Role | Default |
|---|---|---|
| `FUNCTIONS_ENABLED` | Enables the module | `false` |
| `FUNCTIONS_DATA_DIRECTORY` | Code, runtime binaries, secrets and references. Same path on the host and in the API container | `/data/functions` |
| `FUNCTIONS_RUNTIME_DOWNLOAD` | Download the runtime binary from GitHub when it is missing | `true` |
| `FUNCTIONS_RUNTIME_SOURCE_DIR` | Directory holding the runtime binary, for offline installations | empty |

`FUNCTIONS_DATA_DIRECTORY` takes letters, digits and `_ . / -` only. It must be outside `HOSTING_STACKS_DIRECTORY`, `HOSTING_SITES_DIRECTORY`, `SFTP_DIRECTORY`, `SERVICES_DATA_DIRECTORY` and `API_LOG_DIR`. A subdirectory of `DATA_DIR` is fine, `DATA_DIR` itself is not. The API checks it at startup. Every directory under it must be owned by the panel and writable by nobody else.

The menu **Serverless → Functions** appears for admins. If the installation checks fail (directories, Docker), only the module is disabled: the API logs say why, and `GET /functions/config` answers `FUNCTIONS_MISCONFIGURED`.

Limits and budgets: [Configuration reference](../reference/configuration.md#functions).

## Runtime binary

Every function runs the Loch Lambda Runtime binary. The panel build trusts given releases (today v1.0.1, amd64 and arm64) and only stores a binary that matches their size and SHA-256.

| Mode | How |
|---|---|
| **Download** (default) | At startup, the panel downloads the release for the host architecture from GitHub over HTTPS. Allow outbound HTTPS to `github.com`, `release-assets.githubusercontent.com` and `objects.githubusercontent.com`. `HTTPS_PROXY` is honored |
| **Offline** | Set `FUNCTIONS_RUNTIME_DOWNLOAD=false` and `FUNCTIONS_RUNTIME_SOURCE_DIR` to a directory holding `loch-lambda-runtime-linux-<arch>`, mounted read-only in the API container |

```bash
# On a machine with Internet access, then copy the files to the host
gh release download v1.0.1 -R loch-sh/lambda-runtime -p 'loch-lambda-runtime-linux-*' -p 'SHA256SUMS*'
shasum -a 256 -c SHA256SUMS --ignore-missing
```

The source directory and its files must be owned by the panel's user or root and writable by nobody else, as regular files (no symlinks). Otherwise the API refuses to start.

While no trusted binary is installed, the list page says **No trusted function runtime is installed on the server yet**, and creating or starting a function fails with `FUNCTION_RUNTIME_UNAVAILABLE`: the reason is in the API logs. An installed binary is never replaced. One that fails verification must be removed by hand. Release verification: [Releases](/lambda-runtime/developer/releases/).

## What the panel creates

| Object | Name |
|---|---|
| Compose project | `fn-<name>` in `HOSTING_STACKS_DIRECTORY`. It starts with `docker compose up -d` without the panel |
| Private network | `fn-<name>`, created with the function |
| Image | `mirror.gcr.io/amazon/aws-lambda-nodejs`, `…-python` or `…-provided`, pinned by digest |
| Code | Read-only deployments in `FUNCTIONS_DATA_DIRECTORY`, mounted at `/var/task` |
| Secrets | A file of the private directory, never in `compose.yaml` |

A compose file edited by hand is never run again: the function shows **Edited outside the panel** and can only be purged.

## Networks and egress

- A function never joins the `services` network. It joins its own network `fn-<name>` and the private networks you attach.
- It has no published port. Members of its networks reach it on port 8080, with its invoke credentials.
- **Internet access** is off by default. When on, the function also reaches the host gateway, the LAN and cloud metadata endpoints unless `DOCKER-USER` firewall rules block them. Turning it on is audited as a warning.
- Function containers are protected like the API container: no shell, file copy, file tail, port tunnel, container action or `exec` scheduled task. Their stdout logs stay readable by admins. Restricted users never see them, and `fn-*` containers cannot be granted.

## API key scopes

| Scope | Allows |
|---|---|
| `functions:read` | Read functions and the module configuration |
| `functions:write` | Create, resize, start, stop, restart, delete |
| `functions:deploy` | Code, deployments, secrets, credentials, variables, handler, networks, egress, MCP opt-in |
| `functions:invoke` | Invoke. Implied by no other scope but `*` |

The interface does not offer these scopes in its key form yet: use a key with **All permissions**, or create one through the API. Details: [API key scopes](../reference/scopes.md).

## Audit

Every change is audited (`function created`, `function code deployed`, `function secret set` with the name only, `function egress toggled`…). Invocations are counted per function and per minute in `function invoked`, never with their content. Full list: [Audit trail](./audit.md).

## Good to know

- The total memory and CPU of all functions are capped by `FUNCTIONS_MAX_TOTAL_MEMORY` and `FUNCTIONS_MAX_TOTAL_CPUS` (default: the host memory and 4 × its CPUs).
- The kept deployments bound the disk used per function: `FUNCTIONS_DEPLOYMENTS_KEPT` × 250 MB at most.
- Deleting the compose directory does not delete the code or the secrets.
- At startup, the panel removes interrupted uploads and logs the functions edited outside the panel.
- AWS and AWS Lambda are trademarks of Amazon.com, Inc. or its affiliates. Loch.sh is not affiliated with or endorsed by Amazon.
