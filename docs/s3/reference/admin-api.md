---
sidebar_position: 3
title: Admin API reference
description: Endpoints of the Loch S3 user management API (/_loch/users) and the service endpoints /_loch/health and /_loch/usage.
---

# Admin API reference

## Users API

Available when `S3_USERS_FILE` and `S3_ADMIN_API_KEY` are both set. Every request carries `Authorization: Bearer <S3_ADMIN_API_KEY>`.

| Method | Path | Body | Success |
|---|---|---|---|
| `GET` | `/_loch/users` | none | `200` `{"users":[…]}` |
| `GET` | `/_loch/users/{user_id}` | none | `200` user object |
| `PUT` | `/_loch/users/{user_id}` | `{"display_name","access_key_id","secret_access_key"}` | `201` created, `200` replaced. Empty body |
| `DELETE` | `/_loch/users/{user_id}` | none | `204` |

User object:

```json
{"user_id": "backup", "display_name": "Backup job", "access_key_id": "<access key>", "is_root": false}
```

Example:

```bash
curl -X PUT -H "Authorization: Bearer $LOCH_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"display_name":"Backup job","access_key_id":"<access key>","secret_access_key":"<secret key>"}' \
  http://localhost:8080/_loch/users/backup
```

| Rule | Value |
|---|---|
| `user_id` | 1 to 128 characters: letters, digits, `-`, `_` |
| `access_key_id` | Unique among users |
| `secret_access_key` | Write-only: never returned |
| `is_root` | Cannot be set by the API. `root` cannot be changed or deleted |
| Body size | 64 KiB |

Changes are saved to the users file at once (write to a temporary file, then rename) and apply without a restart.

### Errors

Errors use the S3 XML format (`<Error><Code>…</Code>…</Error>`).

| Status | Code | When |
|---|---|---|
| `400` | `InvalidArgument` | Invalid `user_id` or JSON, duplicate access key, unknown user, change to `root` |
| `403` | `AccessDenied` | Missing or wrong key, `S3_ADMIN_API_KEY` unset, or no authentication configured |
| `405` | `MethodNotAllowed` | Single-user mode (`S3_ACCESS_KEY_ID`) |

## Service endpoints

| Method | Path | Auth | Answer |
|---|---|---|---|
| `GET`, `HEAD` | `/_loch/health` | none | `200 {"status":"ok"}`; with a quota, `"quota":"ok"` or `"exceeded"` is added. `503 {"status":"error"}` if the data directory is unreachable. Not logged |
| `GET` | `/_loch/usage` | SigV4, root only (open without authentication) | `200 {"used_bytes":N,"reserved_bytes":N,"limit_bytes":N}`; `limit_bytes` is `null` without quota |
