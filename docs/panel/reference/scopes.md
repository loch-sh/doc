---
sidebar_position: 3
title: API key scopes
description: Every permission an API key can carry, what it allows and whether it needs an admin profile.
---

# API key scopes

A scope limits what an API key can do. The interface calls them **Permissions**. Browser sessions always have every permission of their user. To create a key, see [API keys](../user-guide/api-keys.md).

| Scope | Interface label | Allows | Admin only |
|---|---|---|---|
| `*` | **All permissions** | Everything the user's profile allows. Cannot be combined with other scopes | No |
| `containers:read` | **Read (list, inspect)** | List containers and read their details (`GET /docker`, `GET /docker/{id}`) | No |
| `containers:logs` | **Logs (download, streaming)** | Download logs, stream live logs, read a file inside a container (`/logs/**`, WebSocket `logsStart` / `logsStop`) | No |
| `containers:actions` | **Actions (start, stop, restart, kill, delete)** | Container actions and stack actions (`POST /docker/{id}/{action}`, `POST /stacks/{name}/{action}`) | No |
| `containers:shell` | **Shell (remote terminal)** | Open a terminal in a container (WebSocket `attach`) | No |
| `containers:stats` | **Stats (real-time monitoring)** | Live CPU, RAM, network and PIDs (WebSocket `statsStart` / `statsStop`) | No |
| `containers:proxy` | **Proxy (port tunnel)** | Open a port tunnel to a container (WebSocket `proxyOpen` / `streamOpen`) | No |
| `containers:cp` | **File copy (cp)** | Download and upload files (`GET` / `PUT /docker/{id}/cp`) | No |
| `cron` | **Cron jobs** | Every scheduled task route (`/cron/**`) | No |
| `sftp:read` | **SFTP (read)** | Read SFTP accounts and settings | Yes |
| `sftp:write` | **SFTP (create, edit, delete)** | Change SFTP accounts | Yes |
| `hosting:read` | **Hosting (read)** | Read websites | Yes |
| `hosting:write` | **Hosting (create, edit, deploy, delete)** | Change and deploy websites | Yes |
| `services:read` | **Databases (read)** | Read managed services | Yes |
| `services:write` | **Databases (create, new password, delete)** | Change managed services | Yes |
| `services:expose` | **Databases (publish a port)** | Publish and close the port of an instance. Not implied by `services:write` | Yes |
| `networks:read` | **Private networks (read)** | Read private networks | Yes |
| `networks:write` | **Private networks (create, attach, detach, delete)** | Change private networks, including the networks of a service instance | Yes |
| `audit:read` | **Audit trail (read)** | Read the audit trail (`GET /audit`) | Yes |

## Rules

- **Profile first**: a key carries its user's profile. An admin-only scope on a user's key grants nothing.
- **Container permissions still apply**: a container scope only reaches the containers the user can access.
- **No scope needed**: your own profile and keys (`/users/me`, `/users/me/api-keys`), and the admin routes for users and `/domains`, which check the profile only.
- **No escalation**: a key can only create keys within its own scopes.
- **Validation**: at least one scope is required, unknown scopes are refused. Keys created before scopes existed have no scope and keep full access.

## In the interface

The **Permissions** list of the **New key** form only shows the scopes that apply:

| Scopes | Shown when |
|---|---|
| `sftp:*`, `hosting:*`, `services:*` | You are an admin and the module is enabled (`SFTP_ENABLED`, `HOSTING_ENABLED`, `SERVICES_ENABLED`) |
| `networks:*`, `audit:read` | You are an admin |
