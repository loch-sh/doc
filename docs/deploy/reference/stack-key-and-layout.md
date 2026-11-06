---
sidebar_position: 4
title: Stack key and layout
description: How Loch Deploy derives the stack key from the token, where it stores compose files, data and state, and the registry.json and autostop.json formats.
---

# Stack key and layout

## Stack key

The key identifies a stack. It is derived from the verified token, never from the request:

```text
<key> = slug(project_path) + "-" + slug(environment)
```

The slug reproduces GitLab's `CI_PROJECT_PATH_SLUG`: lowercase, every character other than `a-z` and `0-9` becomes `-`, leading and trailing hyphens trimmed, truncated to 63 bytes. Consecutive hyphens are not collapsed.

| `project_path` | `environment` | Key |
|---|---|---|
| `group/app` | `staging` | `group-app-staging` |
| `Apps/Atmosphere/Shop` | `production` | `apps-atmosphere-shop-production` |
| `acme-shop/api` | `staging` | `acme-shop-api-staging` |
| `acme/shop-api` | `staging` | `acme-shop-api-staging` (collision) |

`environment` is the environment **name**. For simple names (letters and digits, at most 24 characters, starting with a letter) the slug equals `CI_ENVIRONMENT_SLUG`. For other names GitLab adds a hash suffix to `CI_ENVIRONMENT_SLUG` and the slugs differ.

Every compose command is pinned to the key: `docker compose -p <key> --project-directory COMPOSE_BASE/<key> -f COMPOSE_BASE/<key>/docker-compose.yml`.

## Ownership

| Endpoint | Unclaimed key | Key of the caller's `project_id` | Key of another project |
|---|---|---|---|
| `POST /deploy` | Allowed, claimed after a successful `up` | Allowed | `403` |
| `POST /directories` | Allowed, stays unclaimed | Allowed | `403` |
| `POST /exec` | `403` | Allowed | `403` |
| `DELETE /stack` | `403` | Allowed, ownership released | `403` |

The registry also stores the exact `project_path` and `environment` of each key. A different project reaching the same key with a different tuple gets a distinct `403` and a `registry: key collision between distinct deployments` warning in the log. An auto-stop keeps the ownership.

## On-disk layout

| Path | Content | Removed by |
|---|---|---|
| `DATA_DIR/registry.json` | Ownership of each key | Never (entries released by `DELETE /stack`) |
| `DATA_DIR/autostop.json` | Pending auto-stops, keyed `<namespace>/<environment>` | Never (entries removed when done or cancelled) |
| `COMPOSE_BASE/<key>/` | `docker-compose.yml` and the uploaded env files | `DELETE /stack`, auto-stop |
| `COMPOSE_BASE/.staging-<key>-*` | A deploy being validated | The deploy itself |
| `WEBSITES_BASE/<key>/<service>/<name>/` | Application data (bind mounts) | Never |

State files are written atomically (temporary file, rename, directory fsync).

## registry.json {#registry-json}

Also the format of the `-import-registry` file. A JSON object keyed by stack key; each value is an entry object or a bare `project_id` string.

```json
{
  "group-app-staging": {
    "project_id": "42",
    "project_path": "group/app",
    "environment": "staging"
  },
  "other-production": "7"
}
```

| Field | Required | Description |
|---|---|---|
| `project_id` | yes | GitLab project ID owning the key |
| `project_path` | no | Exact project path; enables collision detection |
| `environment` | no | Exact environment name; enables collision detection |
| `claimed_at` | no | Defaults to the import time |

On import, a key already owned by a different `project_id` aborts the whole import. A key owned by the same `project_id` is kept and its missing fields are filled in.
