---
sidebar_position: 2
title: Configuration
description: The essential environment variables of the Loch Panel API, grouped by purpose, and how the API checks them at startup.
---

# Configuration

The API reads its configuration from environment variables (or a `.env` file in its working directory; the environment wins). This page lists the variables you set on most installations.

Full list: [Configuration reference](../reference/configuration.md).

## Authentication

| Variable | Description |
|---|---|
| `OIDC_PROVIDER` | `microsoft` (default), `keycloak` or `generic` |
| `CLIENT_ID`, `CLIENT_SECRET` | OAuth 2.0 client registered in the provider |
| `REDIRECT_URI` | Public URL of the API; the callback is `<REDIRECT_URI>/openid-connect/redirect` |
| `SCOPE` | OAuth scopes, for example `openid email profile` |
| `TENANT_ID`, `APPLICATION_ID` | Microsoft Entra ID only |
| `KEYCLOAK_URL`, `KEYCLOAK_REALM` | Keycloak only |
| `OIDC_DISCOVERY_URL` | Generic provider only |

## Security and network

| Variable | Description |
|---|---|
| `FRONT_URL` | URL of the web interface: the only origin allowed by CORS, the CSRF check and the WebSocket |
| `COOKIE_SECRET` | Secret signing the session cookies, at least 32 characters |
| `PASSWORD_SECRET` | Required at startup, not used by the current version |
| `TRUSTED_PROXIES` | Subnet of your reverse proxy, allowed to set `X-Forwarded-For` |

## Storage

| Variable | Default | Description |
|---|---|---|
| `DATA_DIR` | `./data` | Users, API keys, scheduled tasks (JSON files). `/app/data` in the image |
| `API_LOG_DIR` | `./log` | Directory of `audit.log`. `/app/log` in the image |

## Optional modules

Each module is off by default. Enable it, then set its variables.

| Module | Switch | Guide |
|---|---|---|
| Websites | `HOSTING_ENABLED=true` (also needs `HOSTING_TRAEFIK_NETWORK`) | [Websites](./hosting.md) |
| SFTP accounts | `SFTP_ENABLED=true` (also needs `SFTP_DIRECTORY`, `SFTP_API_URL`, `SFTP_API_KEY`) | [SFTP](./sftp.md) |
| Managed services | `SERVICES_ENABLED=true` | [Managed services](./services.md) |
| Functions (work in progress) | `FUNCTIONS_ENABLED=true` (also needs `HOSTING_STACKS_DIRECTORY`) | [Functions module](./functions.md) |
| Private networks | Always available | [Private networks](./networks.md) |

## Startup checks

The API checks every variable when it starts. If anything is wrong, it **refuses to start** and logs every problem at once (`invalid configuration`, one line per variable):

- a missing required variable, a wrong type or out-of-range value, a `COOKIE_SECRET` shorter than 32 characters;
- an unknown variable with a known prefix (`OIDC_`, `SFTP_`, `HOSTING_`, `SERVICES_`, `FUNCTIONS_`, `NETWORKS_`, `CRON_`, `COOKIE_`, `KEYCLOAK_`, `TRUSTED_`): usually a typo, and the message suggests the closest name;
- a removed variable: the message says what replaces it.

Values are never written in the logs. Only the installation checks of the services and functions modules (paths, mounts, Docker) disable that module without stopping the API.

## Good to know

- Changing a variable requires restarting the API container.
- Variables of the interface container (`API_URL`, `WS_URL`, branding) are listed in [Installation](./installation.md#interface-settings).
