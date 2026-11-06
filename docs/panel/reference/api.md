---
sidebar_position: 2
title: API reference
description: Authentication, error format, every REST route with its scope, and the WebSocket events of the Loch Panel API.
---

# API reference

The API listens on port `2538` and answers in JSON.

## Authentication

| Client | How | Permissions |
|---|---|---|
| Browser | Session after the OIDC login: signed `authorization` cookie (an `Authorization: Bearer <token>` header is also accepted) | Every permission of the user |
| CLI, scripts, MCP | API key in the `X-API-Key` header | The user's profile, limited by the key's scopes |

- **Profile**: a user is admin or restricted. A key carries its user's profile: an admin scope on a restricted user's key grants nothing. Restricted users only see the containers they are granted.
- **Scopes**: a key without scopes (legacy) has full access. `*` grants everything and cannot be combined with other scopes. A key can only create keys within its own scopes. Full list: [API key scopes](./scopes.md).
- **Tokens**: `loch_` followed by 64 hexadecimal characters, shown once, valid up to 365 days, at most 20 keys per user.
- **CSRF**: write requests from a browser must carry the `Origin` of `FRONT_URL`, otherwise `403 FORBIDDEN_ORIGIN`. Clients without a browser are not concerned.
- **Rate limit**: 120 requests per minute per IP. The IP is read from `X-Forwarded-For` only behind a proxy listed in `TRUSTED_PROXIES`.

## Errors

Errors have the form:

```json
{"code": "INSUFFICIENT_SCOPE", "error": "Insufficient API key scope"}
```

`code` is stable and translated by the interface; `error` is a readable fallback.

| Status | Code | Meaning |
|---|---|---|
| 400 | `INVALID_REQUEST_BODY` | Malformed body; strict bodies also refuse unknown fields |
| 401 | `UNAUTHORIZED` | No session, or unknown API key |
| 401 | `API_KEY_EXPIRED` | The API key has expired |
| 403 | `FORBIDDEN` | Invalid session, or not allowed (not admin, container not granted) |
| 403 | `INSUFFICIENT_SCOPE` | The API key lacks the scope |
| 403 | `FORBIDDEN_ORIGIN` | Browser write from another origin |
| 429 | — | Rate limit, plain text answer |
| 500 | `INTERNAL_ERROR` | Server error |

## Routes

In the tables, **Scope** is the API key scope checked by the route; "—" means only the profile is checked. **Admin** means the route is reserved for admins.

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/_health` | Health check, includes the Docker status |
| GET | `/openid-connect/login` | Start an OIDC login |
| GET | `/openid-connect/redirect` | OIDC callback |
| GET | `/openid-connect/logout` | Log out |

### Containers and stacks

| Method | Path | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/docker` | `containers:read` | | Containers, filtered by permissions |
| GET | `/docker/{id}` | `containers:read` | | Container details |
| POST | `/docker/{id}/{action}` | `containers:actions` | | `start`, `stop`, `kill`, `restart`, `delete` |
| POST | `/stacks/{name}/{action}` | `containers:actions` | | `start`, `stop`, `restart` every accessible container of a compose stack, in `depends_on` order |
| GET | `/logs/{id}` | `containers:logs` | | Logs (text) |
| GET | `/logs/{id}/json` | `containers:logs` | | Logs (JSON) |
| GET | `/logs/{id}/file?path=&tail=` | `containers:logs` | | Last lines of a file inside the container |
| GET | `/docker/{id}/cp?path=` | `containers:cp` | | Download a file or directory (tar stream) |
| PUT | `/docker/{id}/cp?path=` | `containers:cp` | | Upload a file or directory (tar stream) |
| GET | `/ws` | per event | | WebSocket, see [below](#websocket) |

### Domains

| Method | Path | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/domains` | — | Yes | Domains routed by Traefik |

### Scheduled tasks

| Method | Path | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/cron` | `cron` | | Tasks |
| POST | `/cron` | `cron` | | Create |
| GET | `/cron/{id}` | `cron` | | Details |
| PUT / PATCH | `/cron/{id}` | `cron` | | Update / partial update |
| DELETE | `/cron/{id}` | `cron` | | Delete |
| POST | `/cron/{id}/run` | `cron` | | Run now (202) |

Admins see every task. Restricted users see, change and delete every HTTP task and the Docker tasks of their containers; they can only create Docker tasks on those containers.

### Users and API keys

| Method | Path | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/users/me` | — | | Current user |
| GET | `/users/me/api-keys` | — | | Own keys, never the token |
| POST | `/users/me/api-keys` | — | | Create a key; the token is returned once |
| DELETE | `/users/me/api-keys/{id}` | — | | Revoke a key |
| GET | `/users` | — | Yes | Users |
| PATCH | `/users/{email}/switch` | — | Yes | Toggle admin / restricted |
| PATCH | `/users/{email}/restrict` | — | Yes | Make restricted |
| PATCH | `/users/{email}` | — | Yes | Update the container permissions |
| DELETE | `/users/{email}` | — | Yes | Delete, and revoke the user's keys |

### SFTP users

Available when `SFTP_ENABLED` is set (`/sftp/config` always answers).

| Method | Path | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/sftp/config` | — | Yes | Plugin status and connection details |
| GET | `/sftp/sites` | `sftp:read` | Yes | Sites |
| GET | `/sftp/users` | `sftp:read` | Yes | Users |
| POST | `/sftp/users` | `sftp:write` | Yes | Create |
| PUT | `/sftp/users/{username}` | `sftp:write` | Yes | Update |
| DELETE | `/sftp/users/{username}` | `sftp:write` | Yes | Delete |
| POST | `/sftp/users/{username}/password` | `sftp:write` | Yes | New password |
| POST | `/sftp/users/{username}/status` | `sftp:write` | Yes | Enable / disable |

### Web hosting

Available when `HOSTING_ENABLED` is set (`/hosting/config` always answers).

| Method | Path | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/hosting/config` | — | Yes | Plugin status, templates, PHP versions, defaults, limits, `defaultNetworks` |
| GET | `/hosting/sites` | `hosting:read` | Yes | Site directories and the hosting using each |
| GET | `/hosting/php-modules?template=&version=` | `hosting:read` | Yes | PHP modules of an image |
| GET | `/hosting/routing-template` | `hosting:read` | Yes | Routing template |
| GET | `/hosting/stacks` | `hosting:read` | Yes | Sites with their status |
| GET | `/hosting/stacks/check-name?name=` | `hosting:read` | Yes | Name availability |
| POST | `/hosting/stacks` | `hosting:write` | Yes | Create and deploy (202, asynchronous) |
| GET | `/hosting/stacks/{name}` | `hosting:read` | Yes | Settings, containers, last operation. Without `hosting:write`, environment values and snippets are masked |
| PUT | `/hosting/stacks/{name}[?force=true]` | `hosting:write` | Yes | Update and redeploy, rolled back on failure (202) |
| POST | `/hosting/stacks/{name}/deploy[?pull=true][&force=true]` | `hosting:write` | Yes | Redeploy (202); `force` overwrites changes made outside the panel |
| DELETE | `/hosting/stacks/{name}[?purgeData=true]` | `hosting:write` | Yes | Delete; site data kept unless `purgeData` (202) |

### Managed services

Available when `SERVICES_ENABLED` is set (`/services/config` always answers).

| Method | Path | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/services/config` | `services:read` | Yes | Module status, engines, versions, options, exposure policy, version discovery state |
| GET | `/services/instances` | `services:read` | Yes | Instances with state, networks, exposure, end of support, available updates |
| GET | `/services/instances/{instance}/resources` | `services:read` | Yes | Resources of an instance |
| POST | `/services/resources` | `services:write` | Yes | Create `{engine, version, name, options, legacyAuth, networks?}`; returns the credentials once |
| POST | `/services/instances/{instance}/resources/{name}/password` | `services:write` | Yes | New password, returned once |
| DELETE | `/services/instances/{instance}/resources/{name}` | `services:write` | Yes | Delete a resource (a dedicated instance is deleted with it) |
| PATCH | `/services/instances/{instance}` | `services:write` | Yes | Change the mutable options of a dedicated instance `{options}` |
| POST | `/services/instances/{instance}/update` | `services:write` | Yes | Update a dedicated instance `{version?}`; returns `{updated, version, image}` |
| POST | `/services/updates/check` | `services:write` | Yes | Discover versions and updates now, at most once per 30 seconds |
| PUT | `/services/instances/{instance}/networks` | `networks:write` | Yes | Replace the networks `{networks}`; the container is recreated |
| PUT | `/services/instances/{instance}/exposure` | `services:expose` | Yes | Publish `{address, port, tlsOptional?}` |
| DELETE | `/services/instances/{instance}/exposure` | `services:expose` | Yes | Close the port |
| DELETE | `/services/instances/{instance}[?purge=true]` | `services:write` | Yes | Remove an empty shared instance; `purge` deletes an instance edited by hand, with its data |

`services:expose` is not implied by `services:write`.

### Private networks

Bodies are strict: unknown fields are refused (`INVALID_REQUEST_BODY`).

| Method | Path | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/networks` | `networks:read` | Yes | Private networks, the system network `services` first |
| GET | `/networks/config` | `networks:read` | Yes | Creation rules |
| GET | `/networks/docker` | `networks:read` | Yes | Docker networks the panel did not create (read-only) |
| GET | `/networks/docker/{id}` | `networks:read` | Yes | One of them, with its members |
| GET | `/networks/{name}` | `networks:read` | Yes | A private network with its members |
| POST | `/networks` | `networks:write` | Yes | Create `{name, description?, subnet?}` (201) |
| PATCH | `/networks/{name}` | `networks:write` | Yes | Change `{description}` |
| DELETE | `/networks/{name}` | `networks:write` | Yes | Delete (204) |
| POST | `/networks/{name}/members` | `networks:write` | Yes | Attach `{kind: "site" \| "instance", name}` |
| DELETE | `/networks/{name}/members/{kind}/{member}` | `networks:write` | Yes | Detach |
| POST | `/networks/{name}/disconnect` | `networks:write` | Yes | Disconnect a container the panel does not manage `{containerId}` (204) |

### Audit trail

| Method | Path | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/audit?from=&to=&user=&event=&exclude=&level=&q=&before=&limit=` | `audit:read` | Yes | Entries, newest first; `limit` up to 500 |

One request reads at most 64 MB of the log, so a page can be shorter than `limit`, even empty. Continue while the response has a `next` cursor, passed as `before`.

## WebSocket

Connect to `/ws` with the session cookie or the `X-API-Key` header. Messages are JSON `{"event": ..., "data": ...}`. The scope is checked on the events that open a session; a missing scope answers with the matching error event (`error`, `logsError`, `statsError`, `proxyError`, `streamError`).

| Client event | Scope | Data |
|---|---|---|
| `attach` | `containers:shell` | `{"id": "container-id"}` |
| `streamInput` | — (after `attach`) | `"command"` |
| `resize` | — (after `attach`) | `{"cols": 120, "rows": 40}` |
| `logsStart` | `containers:logs` | `{"id": "container-id", "tail": 100, "file": "/optional/path"}` |
| `logsStop` | — | — |
| `statsStart` | `containers:stats` | `{"ids": ["container-id-1", "container-id-2"]}` |
| `statsStop` | — | — |
| `proxyOpen` | `containers:proxy` | `{"id": "container-id", "mappings": [{"remote": 5432, "local": 15432}]}` |
| `streamOpen` | `containers:proxy` | `{"streamID": 1, "remotePort": 5432}` |
| `streamClose` | — | `{"streamID": 1}` |

Server events: `attach`, `stdout`, `stderr`, `end`, `logsData`, `logsEnd`, `logsError`, `statsData`, `statsError`, `proxyReady`, `streamOpened`, `streamClose`, `streamError`, `proxyError`, `error`.

| Limit | Value |
|---|---|
| Port proxy data | Binary messages `[streamID: uint32 big endian][payload]` |
| Port proxy | At most 10 mappings per session and 256 concurrent streams |
| Stats | Collected every 2 seconds, at most 20 containers per subscription, one `statsStart` every 3 seconds at most |
