---
sidebar_position: 1
title: Production deployment
description: Run Loch S3 behind a TLS reverse proxy in a hardened container, with a storage quota, health checks and connection limits.
---

# Production deployment

## Reverse proxy {#reverse-proxy}

Loch S3 speaks plain HTTP. Put a TLS reverse proxy in front and keep the S3 port off the network. Example with Caddy:

```text
s3.example.com {
	# The admin API is protected by a single key: keep it off the Internet
	@admin path /_loch/users /_loch/users/*
	respond @admin 403
	reverse_proxy s3:8080
}
```

Clients use `https://s3.example.com` with path-style URLs. The proxy must forward the `Host` header unchanged: it is part of the signature.

## Hardened container {#hardened-container}

The server only writes to `S3_DATA_DIR`. It runs with a read-only root filesystem and no capabilities:

```yaml
services:
  s3:
    image: ghcr.io/loch-sh/s3:1.4.1
    restart: unless-stopped
    read_only: true
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    user: "100:101"
    mem_limit: 128m
    pids_limit: 64
    environment:
      S3_USERS_FILE: /etc/s3/users.json
      S3_ENCRYPTION_KEY_FILE: /run/secrets/master.key
      S3_ENCRYPT_BY_DEFAULT: "true"
      S3_MAX_STORAGE_BYTES: "107374182400"   # 100 GiB
      S3_INIT_BUCKETS: backups,media
    volumes:
      - /srv/s3/data:/data
      - /srv/s3/conf:/etc/s3:ro
      - /srv/s3/secrets:/run/secrets:ro
```

| Mount | Mode | Content |
|---|---|---|
| `/data` | read-write | Buckets, objects, metadata. One filesystem, case-sensitive (Linux) |
| users file | read-only | Never written while `S3_ADMIN_API_KEY` is unset |
| master key | read-only | Mode `0400`, owned by the container uid |

With a read-only users file, the file must already exist: the server exits instead of bootstrapping it. Users then change only by editing the file and restarting.

Keep the PID limit above `S3_MAX_BLOCKING_THREADS` (32) plus the number of CPUs plus a few.

## Quota {#quota}

`S3_MAX_STORAGE_BYTES` caps the whole data directory: objects, versions, multipart parts in progress and metadata files. A write that would cross it fails with `403 QuotaExceeded`; deletes still work. Versioned buckets reserve twice the object size.

The quota counts file sizes, not disk blocks or inodes. For a hard disk limit, also give the data directory its own volume or filesystem quota.

## Health and usage

| Endpoint | Auth | Answer |
|---|---|---|
| `GET` or `HEAD /_loch/health` | none | `200 {"status":"ok"}`, plus `"quota":"ok"` or `"exceeded"` when a quota is set; `503` if the data directory is unreachable |
| `GET /_loch/usage` | SigV4, root | `{"used_bytes":…,"reserved_bytes":…,"limit_bytes":…}` |

```bash
curl --aws-sigv4 "aws:amz:us-east-1:s3" -u "$ROOT_KEY:$ROOT_SECRET" https://s3.example.com/_loch/usage
```

## Logs

The server logs to standard error (`docker logs`): startup settings, then one line per request and per response with the method, path and status. Headers and query strings are never logged. Health probes are not logged. There is no metrics endpoint.

## Shutdown

On `SIGTERM`, the server stops accepting connections and gives running requests `S3_SHUTDOWN_GRACE` seconds (8 by default, below Docker's 10-second stop timeout). An interrupted upload leaves no object.

## Good to know

- Slow uploads are cut: no data for 60 seconds, or less than `S3_MIN_UPLOAD_RATE` bytes/s (4096) over 60 seconds, ends with `400 RequestTimeout`.
- At most `S3_MAX_CONNECTIONS` (1024) connections at once; extra ones are closed.
- HTTP/2 connections that answer pings never time out: keep the proxy in front.
- Every limit: [Limits](../reference/limits.md). Every variable: [Configuration reference](../reference/configuration.md).
