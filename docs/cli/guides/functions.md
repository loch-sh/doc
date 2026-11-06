---
sidebar_position: 8.5
title: Functions
description: Create functions from handlers written for AWS Lambda, deploy code, invoke them, read their logs, set secrets and credentials, and run them locally with loch functions dev.
---

# Functions

:::caution Work in progress
Functions are a work in progress: the API, the interface and the CLI exist, but the feature can still change. Runtime updates, external secret stores, public HTTP access and a per-function disk quota are not available yet.
:::

`loch functions` (alias `loch fn`) runs handlers written for AWS Lambda™ (Node.js, Python, or a compiled `bootstrap` for Go, Rust…) on a Loch Panel server, on [Loch Lambda Runtime](/lambda-runtime/). Admin only; the functions module must be enabled. Panel side: [Functions](/panel/user-guide/functions/).

## Commands

| Command | Does |
|---|---|
| `loch functions config` | Shows the runtimes and versions, limits, defaults and whether the runtime binary is ready. |
| `loch functions ls` | Lists the functions and their state. |
| `loch functions show <name>` | Shows the configuration, variables, secret names, deployments and endpoint. |
| `loch functions create <name> --runtime <r> --version <v>` | Creates a function. Shows the invoke credentials once. |
| `loch functions deploy <name> <dir\|zip>` | Deploys a directory (zipped here) or a zip, and activates it. |
| `loch functions deployments <name>` | Lists the kept deployments. |
| `loch functions activate <name> <id>` | Activates a kept deployment (alias `rollback`). |
| `loch functions invoke <name>` | Invokes with a JSON event and prints the response. |
| `loch functions logs <name>` | Shows the function output (`-f` to follow). |
| `loch functions update <name>` | Changes resources, handler, variables or the MCP opt-in. |
| `loch functions secrets <name>` | Lists the secret names (`set`, `rm` to change them). |
| `loch functions credentials rotate <name>` | Generates new invoke credentials (`--sigv4` / `--no-sigv4`). |
| `loch functions networks <name> [--network <n>…]` | Shows or replaces the networks. |
| `loch functions egress <name> on\|off` | Allows or blocks outbound Internet access. |
| `loch functions start\|stop\|restart <name>` | Starts, stops or restarts a function. |
| `loch functions delete <name>` | Deletes a function, its code, secrets and credentials (`--purge` for one edited outside the panel). |
| `loch functions dev` | Runs a function on your machine (below). |

Every flag: [`loch functions` reference](../reference/commands/loch_functions.md).

## Create, deploy, invoke

```bash
loch functions create thumbnail --runtime nodejs --version 22 --handler index.handler \
  --memory 512 --env BUCKET=media --secret S3_SECRET --network media \
  --credentials-file ~/.config/loch/thumbnail.credentials.json
loch functions deploy thumbnail ./build
loch functions invoke thumbnail --event-json '{"key": "cat.jpg"}'
loch functions logs thumbnail -f
```

- **Runtimes**: `nodejs`, `python`, `provided` (custom runtime, version `al2023`). `loch functions config` lists the versions of the server.
- **Code**: install the dependencies first (`node_modules`, `pip install -t .`): nothing is built on the server. A directory is zipped here, without `.git` and `*.credentials.json`.
- **Invocation**: the event comes from `--event-json`, `--event <file>` or stdin (empty means `{}`), one JSON value of 6 MiB at most. The response goes to stdout, the end of the logs and the status to stderr. Exit code 1 when the function returns an error.

For a Go or Rust function, build a Linux executable named `bootstrap` for the server architecture (`arch` in `loch functions config`) and put it at the root of the code. See [Custom runtimes](/lambda-runtime/guides/custom-runtimes/).

## Secrets and credentials

- Secret values are never taken from the command line: `--secret NAME` and `loch functions secrets set <name> NAME` read the value without echo, or from stdin; `--secret-file NAME=path` reads a file.
- The invoke credentials (a bearer token, and with `--sigv4` an AWS SDK key pair the function code can read) are returned once, at creation and rotation. They are printed only on a terminal; `--credentials-file` writes them to a new file with mode 0600, outside the code directory.
- If the answer is lost (network error, Ctrl+C), check with `loch functions show`, then rotate the credentials.

```bash
printf '%s\n' "$TOKEN" | loch functions secrets set thumbnail API_TOKEN
loch functions credentials rotate thumbnail --credentials-file ~/.config/loch/thumbnail.credentials.json
```

## Run a function locally

`loch functions dev` runs a function on your machine with Docker, in a container that mirrors the deployed one (same AWS base image, limits and hardening). It needs no panel nor API key. It downloads the Loch Lambda Runtime release this `loch` build trusts, checks its SHA-256 and keeps it in the cache directory (`$XDG_CACHE_HOME/loch/lambda-runtime/`).

| Command | Does |
|---|---|
| `loch functions dev [dir] --runtime <r:v>` | Starts the function in the foreground, streams its logs; Ctrl-C removes it. `--detach` leaves it running. |
| `loch functions dev invoke [name]` | Invokes it through `docker exec` (no credential). |
| `loch functions dev info [name]` | Prints the local endpoint, credentials and ready-to-use `curl` / `aws` commands. |
| `loch functions dev logs [name]` | Shows its logs. |
| `loch functions dev ls` | Lists the local functions. |
| `loch functions dev down [name]` | Removes the container, network and cache files. |
| `loch functions dev event <type>` | Prints a sample event: `s3-put`, `sqs`, `api-gateway-v2`, `schedule`. |
| `loch functions dev runtime` | Shows the runtime binary used and how to verify it by hand. |

```bash
loch functions dev --runtime nodejs:24 --handler index.handler --watch
loch functions dev event s3-put --bucket media --key in/cat.jpg | loch functions dev invoke
```

- The invoke port is published on `127.0.0.1` only (default 9000) and needs the credentials printed at start. `--no-auth` turns them off.
- Outbound access is on by default locally, unlike a deployed function. `--egress=false` gives an internal network, as deployed by default.
- `--watch` restarts the function when the code changes. `--from <function>` takes the settings of a deployed function (never its values; give them with `--env` / `--env-file`).
- `--runtime-binary <path>` or `LOCH_RUNTIME_BINARY` runs a local build of the runtime instead.

Every flag: [`loch functions dev` reference](../reference/commands/loch_functions_dev.md).

## Permissions

| Command | Scope | Admin |
|---|---|---|
| `config`, `ls`, `show`, `deployments`, `dev --from` | `functions:read` | Yes |
| `create`, `update` (resources), `start`, `stop`, `restart`, `delete` | `functions:write` | Yes |
| `deploy`, `activate`, `secrets`, `credentials`, `networks`, `egress`, `update` (handler, variables, MCP opt-in) | `functions:deploy` | Yes |
| `invoke` | `functions:invoke` | Yes |
| `logs` | `containers:read` and `containers:logs` (container routes, no `functions:*` scope) | Yes |
| `dev` (except `--from`) | None: local only | No |

Creating a function with variables, networks, `--egress`, `--sigv4` or `--mcp-invocable` needs `functions:deploy` too.

## Good to know

- Names: 1 to 21 lowercase letters, digits or dashes, starting with a letter.
- A function never joins the `services` network. Attach the sites that call it to its network `fn-<name>`.
- `--egress` lets the code reach the Internet, the host, the LAN and metadata endpoints unless firewall rules block them.
- What a function prints and returns is untrusted: control characters are replaced unless `--raw`.
- `--mcp-invocable` lets AI assistants invoke the function through `loch mcp`: see [MCP tools](../reference/mcp-tools.md#functions).
