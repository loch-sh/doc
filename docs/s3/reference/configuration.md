---
sidebar_position: 1
title: Configuration reference
description: Every environment variable of the Loch S3 server and of the loch-s3 CLI, with its default value.
---

# Configuration reference

Loch S3 reads its configuration from environment variables only. Most invalid values stop the server at startup with `Invalid configuration: …` and exit status 1.

## Server {#server}

| Variable | Default | Description |
|---|---|---|
| `S3_PORT` | `8080` | Listen port, on all interfaces |
| `S3_DATA_DIR` | `./data` (`/data` in the image) | Data directory. Created if missing |
| `S3_USERS_FILE` | none | Users JSON file. Enables multi-user mode; created with a `root` user if missing |
| `S3_ACCESS_KEY_ID` | none | Single-user mode access key. Set with `S3_SECRET_ACCESS_KEY`. Ignored when `S3_USERS_FILE` is set |
| `S3_SECRET_ACCESS_KEY` | none | Single-user mode secret key |
| `S3_ADMIN_API_KEY` | none | Bearer key of the `/_loch/users` admin API. Only with `S3_USERS_FILE`. Unset: the API is off and the users file is never written |
| `S3_ENCRYPTION_KEY` | none | SSE-S3 master key: 32 bytes, base64-encoded (`openssl rand -base64 32`) |
| `S3_ENCRYPTION_KEY_FILE` | none | File holding the base64 master key. Cannot be combined with `S3_ENCRYPTION_KEY` |
| `S3_ENCRYPT_BY_DEFAULT` | `false` | `true`: encrypt with SSE-S3 every write that has no SSE header. Needs a master key. Accepts `true`/`false`, `1`/`0`, `yes`/`no` |
| `S3_MAX_STORAGE_BYTES` | unlimited | Quota of the whole data directory, in bytes |
| `S3_INIT_BUCKETS` | none | Comma-separated buckets created at startup if missing, owned by `root` |
| `S3_UPLOAD_TTL` | `86400` | Seconds before an unfinished multipart upload is deleted. Checked every 5 minutes |
| `S3_MIN_UPLOAD_RATE` | `4096` | Minimum upload speed in bytes/s over 60-second windows. `0` disables |
| `S3_MAX_CONNECTIONS` | `1024` | Maximum simultaneous connections. Extra ones are closed. An invalid value falls back to the default |
| `S3_SHUTDOWN_GRACE` | `8` | Seconds given to running requests after `SIGTERM` or `SIGINT` |
| `S3_MAX_BLOCKING_THREADS` | `32` | Size cap of the file I/O thread pool. Keep it under the container PID limit |

The server refuses to start when:

- only one of `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` is set, or one is empty;
- the users file is invalid, or cannot be created;
- the master key is empty, unreadable, not base64, or not 32 bytes once decoded, or both key variables are set;
- `S3_ENCRYPT_BY_DEFAULT=true` without a master key;
- a name in `S3_INIT_BUCKETS` is not a valid bucket name;
- a numeric variable is not a number.

## loch-s3 CLI {#cli}

| Variable | Flag | Default | Description |
|---|---|---|---|
| `LOCH_SERVER` | `--server` | `http://localhost:8080` | Server URL |
| `LOCH_ADMIN_KEY` | `--api-key` | required | Value of `S3_ADMIN_API_KEY` |
| `LOCH_ACCESS_KEY` | `--access-key` | required by `users put` | Access key to set |
| `LOCH_SECRET_KEY` | `--secret-key` | required by `users put` | Secret key to set |

Flags win over variables.
