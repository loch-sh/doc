---
sidebar_position: 2
title: Users and admin API
description: Manage Loch S3 users with the users file, the loch-s3 CLI or the /_loch/users admin API.
---

# Users and admin API

Multi-user mode starts when `S3_USERS_FILE` is set. Each user has a `user_id`, an access key and a secret key. Exactly one user is `root`.

## Users file

If the file does not exist, the server creates it on first start with a `root` user and random keys (mode `0600`), and prints the access key. The secret is in the file.

You can also write it yourself before the first start:

```json
{
  "users": [
    {"user_id": "root", "display_name": "Root", "access_key_id": "<20 random chars>", "secret_access_key": "<40 random chars>", "is_root": true},
    {"user_id": "backup", "display_name": "Backup job", "access_key_id": "<20 random chars>", "secret_access_key": "<40 random chars>"}
  ]
}
```

Rules: one `root`, unique `user_id` and `access_key_id`, no empty field. An invalid file stops the server. Without the admin API, edit the file and restart.

## Enable the admin API

Set `S3_ADMIN_API_KEY` to a long random value:

```bash
openssl rand -hex 32
```

The API is served on `/_loch/users` and authenticated with `Authorization: Bearer <key>`. It then writes the users file, so the file must be writable.

:::warning
The admin API is protected by this single key. Never expose `/_loch/users` to the Internet: block it at the reverse proxy, as in [Production deployment](./production.md#reverse-proxy).
:::

## loch-s3 CLI

`loch-s3` ships in the Docker image and in the release archives.

```bash
export LOCH_SERVER=http://localhost:8080 LOCH_ADMIN_KEY=<admin key>
loch-s3 users create "Backup job"
```

`create` derives the `user_id` from the name (`backup-job`), generates the keys and prints them once.

| Command | Action |
|---|---|
| `loch-s3 users list` | List users |
| `loch-s3 users get <user_id>` | Show one user |
| `loch-s3 users create <name>` | Create a user with generated keys (replaces the keys if it exists) |
| `loch-s3 users put <user_id> --display-name <name> --access-key <id> --secret-key <secret>` | Create or update with your own keys |
| `loch-s3 users delete <user_id>` | Delete a user |

| Flag | Variable | Default |
|---|---|---|
| `--server` | `LOCH_SERVER` | `http://localhost:8080` |
| `--api-key` | `LOCH_ADMIN_KEY` | required |
| `--access-key`, `--secret-key` (`put`) | `LOCH_ACCESS_KEY`, `LOCH_SECRET_KEY` | required |

Prefer the variables to the flags: flags show up in the process list.

From the container:

```bash
docker compose exec s3 sh -c 'loch-s3 --api-key "$S3_ADMIN_API_KEY" users list'
```

## Good to know

- Secret keys are never returned by the API: save them when you create the user.
- The API cannot create, change or delete `root`. Change root keys in the file.
- A new user owns no bucket. Give access with a [bucket policy](../guides/access-control.md#bucket-policies) on `arn:loch:iam:::user/<user_id>`, or let the user create buckets.
- Deleting a user keeps the buckets they own. A new user with the same `user_id` owns them again.
- Single-user mode (`S3_ACCESS_KEY_ID`) has no admin API.

Endpoints: [Admin API reference](../reference/admin-api.md).
