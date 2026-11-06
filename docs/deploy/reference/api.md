---
sidebar_position: 2
title: API reference
description: The Loch Deploy HTTP endpoints - health, deploy, stack, directories, exec - with their fields and status codes.
---

# API reference

Every endpoint except `/health` requires `Authorization: Bearer <id_token>`. There are no path parameters: the project, namespace and environment come from the token. Error responses are `text/plain`.

| Endpoint | Purpose |
|---|---|
| [`GET /health`](#get-health) | Liveness probe |
| [`POST /deploy`](#post-deploy) | Validate and bring up a compose stack |
| [`DELETE /stack`](#delete-stack) | Stop and remove the stack |
| [`POST /directories`](#post-directories) | Create bind-mount directories |
| [`POST /exec`](#post-exec) | Run a command in a service container |

## Common status codes

Checked in this order: IP allowlist, token, namespace, protected environment, then the handler.

| Status | Cause |
|---|---|
| `400` | Token without `project_path`, `project_id` or `environment`, invalid derived slug, invalid body |
| `401` | Missing or invalid token |
| `403` | IP not allowed, namespace not allowed, protected-environment rule, ownership |

## GET /health {#get-health}

No authentication, exempt from the IP allowlist, not audited. Returns `200` with `{"status":"ok"}`.

## POST /deploy {#post-deploy}

`multipart/form-data`, at most `MAX_UPLOAD_MB`.

| Field | Required | Description |
|---|---|---|
| `compose_file` | yes | The `docker-compose.yml` |
| `env_files` or `env_files[]` | no | One field per env file, both spellings merged. Name: optional leading dot, then up to 128 letters, digits, `.`, `_`, `-`. `docker-compose.yml` and `*.tmp` reserved; no duplicates |
| `auto_stop_days` | no | Integer `1` to `365`. Absent cancels a pending auto-stop |

```bash
curl --fail-with-body -sS -X POST -H "Authorization: Bearer $DEPLOY_JWT" \
  -F "compose_file=@docker-compose.yml" -F "env_files=@api.env" -F "auto_stop_days=7" \
  "$DEPLOY_URL/deploy"
```

| Status | Cause |
|---|---|
| `204` | Stack deployed |
| `400` | Invalid form, body too large, invalid `auto_stop_days` or env file name, missing `compose_file`, `include`/`extends`/`label_file`, reserved `.env` variable, `docker compose config` error, policy violation |
| `403` | Protected-environment rule, key owned by another project, key collision |
| `409` | An existing container of the stack has a bind mount outside the layout |
| `500` | Filesystem error, container inspection failed, `pull` or `up` failed, ownership not recorded |
| `503` | Request cancelled while waiting for the stack lock, or during inspection, `config` or `pull` |
| `504` | Inspection, `config`, `pull` or `up` exceeded its timeout |

The server writes the files to a staging directory, validates them, then replaces the stack directory and runs `pull` and `up -d --remove-orphans --no-build`. Nothing touches the running stack before validation passes. Env files of a previous deploy that are not re-uploaded are removed. Once `up` has started, a cancelled pipeline no longer stops it. Failure messages carry a redacted excerpt of the compose output (last 400 bytes). Steps in detail: [Deployment policy](./deployment-policy.md).

## DELETE /stack {#delete-stack}

No body.

1. If the compose file exists, `docker compose down --remove-orphans`.
2. Every remaining container of the stack (legacy stack without compose file, containers named after the key) is stopped and removed.
3. The compose directory is removed, the ownership released, the auto-stop cancelled.

Data under `WEBSITES_BASE` is kept.

```bash
curl --fail-with-body -sS -X DELETE -H "Authorization: Bearer $DEPLOY_JWT" "$DEPLOY_URL/stack"
```

| Status | Cause |
|---|---|
| `204` | Stack removed |
| `403` | Key not claimed, or owned by another project |
| `500` | `down`, container removal or directory removal failed; ownership and directory are kept, retry |
| `503` | Request cancelled while waiting for the stack lock |

## POST /directories {#post-directories}

`application/json`, at most 1 MiB. Creates `WEBSITES_BASE/<key>/<service>/<name>/`.

```json
{"entries": [{"service": "api", "name": "storage", "user": "1000", "group": "1000", "mode": "0750"}]}
```

| Field | Required | Rule |
|---|---|---|
| `service` | yes | Lowercase letters, digits, `-`; at most 63 characters; starts and ends with a letter or digit |
| `name` | yes | Letters, digits, `.`, `_`, `-`; at most 128 characters; no leading dot |
| `user` | no | Numeric UID, `0` to `2147483647`. Names are refused |
| `group` | no | Numeric GID, `0` to `2147483647`. Names are refused |
| `mode` | no | Octal string (`"0750"`, optional `0o` prefix), at most `0777`. Default `0755` |

`mode`, `user` and `group` apply to the `<name>` directory only, also when it already exists. `<key>/` and `<key>/<service>/` are created `root:root 0755` and never changed. Every entry is validated before the first write. An unclaimed key is accepted and stays unclaimed.

| Status | Cause |
|---|---|
| `204` | Directories created (also for an empty list) |
| `400` | Invalid JSON or entry |
| `403` | Key owned by another project |
| `409` | A symlink or a non-directory is in the way, or a path escapes the stack directory |
| `500` | Other filesystem error |

## POST /exec {#post-exec}

`application/json`, at most 1 MiB. Runs `docker compose exec -T` in a running container, without a shell, 5 minute timeout. Not serialized with deploys.

```json
{"service": "api", "command": ["php", "bin/console", "app:client:install", "acme"]}
```

| Status | Body | Cause |
|---|---|---|
| `200` | `{"stdout": "...", "stderr": "..."}` | Exit status 0 |
| `400` | text | Invalid JSON or service, empty command |
| `403` | text | Key not claimed, or owned by another project |
| `422` | `{"stdout": "...", "stderr": "..."}` | Non-zero exit |
| `503` | `{"stdout": "...", "stderr": "..."}` | Request cancelled; the command is interrupted |
| `504` | `{"stdout": "...", "stderr": "..."}` | Timeout |

`stdout` and `stderr` are each capped at 1 MiB; truncated output ends with `[truncated]`. The command is written verbatim to the audit log.
