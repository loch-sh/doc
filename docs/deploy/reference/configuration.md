---
sidebar_position: 1
title: Configuration reference
description: Every Loch Deploy environment variable with its default and validation, the command-line flags and the fixed HTTP and docker limits.
---

# Configuration reference

All settings are read from environment variables at startup (`config/config.go`). An invalid value logs `invalid configuration` and exits with status `1`. At startup the server also runs OIDC discovery on `GITLAB_ISSUER` and exits if it fails.

## Environment variables

| Variable | Default | Validation and behavior |
|---|---|---|
| `LISTEN_ADDR` | `:8080` | HTTP listen address, plain HTTP. The image healthcheck derives its port from it; bind all interfaces or loopback |
| `COMPOSE_BASE` | `/data/compose` | Root of the compose directories, one per stack. Same path on host and container |
| `WEBSITES_BASE` | `/data/websites` | Root of the bind-mount data. Same path on host and container |
| `DATA_DIR` | `./data` | Server state (`registry.json`, `autostop.json`), created with mode `0700`. The image and the reference deployment use `/app/data` |
| `MAX_UPLOAD_MB` | `10` | Maximum `POST /deploy` body, in MB. Integer from `1` to `1024` |
| `GITLAB_ISSUER` | required | GitLab OIDC issuer. Absolute `https://` URL with a host |
| `GITLAB_AUDIENCE` | required | Required `aud` claim. Must equal `aud` in the jobs' `id_tokens` |
| `PROTECTED_ENVS` | `production` | Comma-separated environment names requiring `ref_protected`. Slugified like the token claim (`Production` = `production`); a name with an empty slug is refused |
| `ALLOWED_NAMESPACES` | empty: all projects | Comma-separated GitLab namespace paths. A token passes when `namespace_path` equals one or is a sub-path of one (`apps/x` allows `apps/x/api`, not `apps/x-evil`). Lowercased, surrounding slashes stripped, `.` and `..` segments refused. Empty logs a warning |
| `FORBIDDEN_TRAEFIK_HOSTS` | empty | Comma-separated hosts no Traefik `Host()` rule may name. Port and trailing dot stripped, lowercased, deduplicated; each must be a DNS name or an IP |
| `ALLOWED_EXTERNAL_NETWORKS` | empty: none | Comma-separated Docker networks stacks may join with `external: true`. Case-sensitive, must match `^[a-zA-Z0-9][a-zA-Z0-9_.-]*$` |
| `ALLOWED_IPS` | empty: disabled | Comma-separated IPs or CIDRs. Other clients get `403`; `/health` is exempt. Empty logs a warning |
| `TRUSTED_PROXIES` | empty | Comma-separated IPs or CIDRs of proxies allowed to set `X-Forwarded-For`. Required for `ALLOWED_IPS` behind a proxy. Keep it to the proxy's exact address |

Bare IPs in `ALLOWED_IPS` and `TRUSTED_PROXIES` are treated as `/32` (IPv4) or `/128` (IPv6).

### Client IP behind a proxy

- From a peer outside `TRUSTED_PROXIES`, the socket IP is used and `X-Forwarded-For` is ignored.
- From a trusted proxy, the right-most `X-Forwarded-For` address that is not itself a trusted proxy is used. An unparsable entry makes the request refused.
- An absent header, or one listing only proxies, falls back to the socket IP.

## Flags

| Flag | Effect |
|---|---|
| `-version` | Prints `deploy-server <version>` and exits |
| `-import-registry <file>` | Merges `<file>` (`registry.json` format) into `DATA_DIR/registry.json`, then exits. Reads only `DATA_DIR`. All-or-nothing. Exit `0` on success, `1` on failure, `2` on invalid arguments. Run it with the server stopped |

Format of the file: [Stack key and layout](./stack-key-and-layout.md#registry-json).

## HTTP limits

Fixed in the code:

| Limit | Value |
|---|---|
| Request headers read (`ReadHeaderTimeout`) | 10 s |
| Whole request read, body included (`ReadTimeout`) | 5 min |
| Whole request handling (`WriteTimeout`) | 16 min |
| Keep-alive idle (`IdleTimeout`) | 60 s |
| Request headers size | 64 KiB |
| JSON body (`/exec`, `/directories`) | 1 MiB |
| Multipart body (`/deploy`) | `MAX_UPLOAD_MB` |
| Graceful shutdown on `SIGINT` / `SIGTERM` | 30 s |

## Docker limits

| Operation | Timeout |
|---|---|
| Inspection of the stack's existing containers | 30 s in total |
| `docker compose config` | 1 min |
| `docker compose pull` | 7 min |
| `docker compose up` | 7 min |
| `docker compose down` | 10 min |
| Removal of remaining containers | 2 min |
| `docker compose exec` (`/exec`) | 5 min |
| Each auto-stop | 10 min |

A command over its timeout is interrupted, then killed after 10 s. At most 4 docker processes run at once server-wide; the wait for a slot is not counted in the timeouts. Output is capped at 1 MiB per stream. At most 2 auto-stops run at once.

## Token checks

| Check | Value |
|---|---|
| Signature, `iss`, `aud`, `exp` | Against the GitLab JWKS |
| Maximum token age (`iat`) | 10 min |
| `iat` in the future | At most 30 s |
| Clock skew | 30 s |
| Timeout of requests to GitLab | 10 s |
