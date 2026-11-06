---
sidebar_position: 3
title: Operations
description: Read the Loch Deploy audit log, back up its state and data, and upgrade the server.
---

# Operations

## Logs and audit

The server writes JSON lines to stderr. Every protected request, refusals included, produces exactly one entry with `"msg":"audit"`. `GET /health` is not audited.

```bash
docker compose logs deploy-server | grep '"msg":"audit"'
```

| Field | Content |
|---|---|
| `method`, `path`, `status`, `client_ip`, `duration_ms` | Always present |
| `error` | First 256 bytes of the error response |
| `auth_error` | Precise token failure (expired, wrong audience, too old), never sent to the client |
| `authz_error` | Reason of a namespace or protected-environment `403` |
| `project_path`, `namespace_path`, `project_id`, `environment`, `ref`, `ref_protected`, `user_login`, `sha` | Identity from the token |
| `auto_stop_days`, `env_files` | On `/deploy`: requested auto-stop and env file names, never their content |
| `legacy_mounts` | On a `409`: the refused bind mounts, with full host paths |
| `service`, `command` | On `/exec`: target and full command |
| `directories` | On `/directories`: `service/name` of each entry |

Level is `INFO` on success, `WARN` on 4xx, `ERROR` on 5xx. The server exposes no metrics.

## Backup

| Path | Content | Note |
|---|---|---|
| `DATA_DIR` (`./data` in the reference deployment) | `registry.json` (ownership), `autostop.json` (scheduled stops) | Small; written atomically |
| `COMPOSE_BASE` (`/data/compose`) | One directory per stack: compose file and env files | Env files hold application secrets |
| `WEBSITES_BASE` (`/data/websites`) | Application data of the bind mounts | Never deleted by the server |

Back up `WEBSITES_BASE` without following symlinks: containers can create them inside their own directories. Restore `DATA_DIR` with the server stopped.

## Upgrade

1. Read the release notes on [GitHub](https://github.com/loch-sh/deploy/releases).
2. Wait until no pipeline is deploying: on `SIGTERM` the server waits only 30 seconds for in-flight requests, a deploy can last longer.
3. Pull and restart:

   ```bash
   docker compose pull deploy-server
   docker compose up -d deploy-server
   ```

4. Check that the container is `healthy` and the log shows the new version in `deploy-server starting`.

Each image ships a given docker CLI and Compose version. The policy is a deny-list: review it against the Compose version of every new release.

```bash
docker run --rm ghcr.io/loch-sh/deploy:1.0 -version
```
