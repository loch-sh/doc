---
sidebar_position: 9
title: Security
description: What a Loch Panel admin must know about API keys, the origin check, the protected API container and network exposure.
---

# Security

The points an admin must get right. The API applies the rest by itself.

## Network exposure

- **The API controls Docker.** It mounts the Docker socket: whoever controls the API controls the host. Publish it only through an HTTPS reverse proxy.
- **HTTPS only.** Session cookies are `Secure`, `httpOnly` and signed with `COOKIE_SECRET` (at least 32 characters). Keep this secret out of version control.
- **Trusted proxies.** The client IP (rate limit, audit trail) is read from `X-Forwarded-For` only when the request comes from the loopback or from `TRUSTED_PROXIES`. List the reverse proxy subnet only, never a whole Docker range: any container could then forge its IP.
- **Rate limit**: 120 requests per minute per IP, WebSocket included.

## Origin check (CSRF)

The session cookie is `SameSite=None`, so the API checks the origin of every write request (`POST`, `PUT`, `PATCH`, `DELETE`):

- a browser request must carry the `Origin` of `FRONT_URL` (scheme, host and port), otherwise it gets `403 FORBIDDEN_ORIGIN`;
- the WebSocket checks the same origin;
- requests without browser headers (CLI, MCP server, scripts) are not concerned: they use API keys, not cookies.

If writes fail with `FORBIDDEN_ORIGIN`, `FRONT_URL` does not match the URL users type in their browser.

## API keys

Each user creates their own keys, for the `loch` CLI and scripts.

| Rule | Value |
|---|---|
| Format | `loch_` + 64 hexadecimal characters, sent in `X-API-Key` |
| Shown | Once, at creation; only its SHA-256 hash is stored |
| Lifetime | 1 to 365 days |
| Per user | 20 keys at most |
| Profile | The key has the profile of its user: a restricted user's key never reaches admin routes |
| Scopes | A key can be limited to some features; it can only create keys within its own scopes |

- Deleting a user revokes all their keys.
- Admin routes (users, domains, websites, SFTP, services, networks, functions, audit) always require the admin profile, whatever the scopes.
- Full list of scopes: [API key scopes](../reference/scopes.md).

## The API container is protected

Nobody, admin included, can open a shell in the API container, copy files to or from it, follow its files, or target it with an `exec` scheduled task. These would give access to the audit log. Stack actions also skip it.

Function containers (`fn-*`) are protected the same way: no shell, file copy, file tail, port tunnel, container action or Docker scheduled task, since they hold secrets. Their environment is masked. Manage them from the function page. See [Functions module](./functions.md).

## Private networks are not a sandbox

[Private networks](../network/private-networks.md) separate the panel's sites and service instances from each other. They are **not** an access control against CI stacks or anything with access to the Docker socket: any container can join a network by name. The panel shows the containers it does not manage on its networks, so you can disconnect them.

## Good to know

- Grant restricted users only the containers they need: a shell in a container gives everything that container can reach.
- Check the [audit trail](./audit.md) for `access denied` entries.
- Managed services (published ports, TLS) have their own rules: see [Managed services](../services/overview.md).
- To report a vulnerability, contact the maintainers privately, not in a public issue.
