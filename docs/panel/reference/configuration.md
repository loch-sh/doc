---
sidebar_position: 1
title: Configuration reference
description: Every environment variable of the Loch Panel API, with its default value and description, grouped by module.
---

# Configuration reference

Every environment variable read by the API. The API also loads a `.env` file from its working directory; variables already set in the environment win. For the essentials, read [Configuration](../admin/configuration.md).

Every variable is checked at startup: a missing required variable, an invalid value, an out-of-range number, an unknown variable with a known prefix (`OIDC_`, `SFTP_`, `HOSTING_`, `SERVICES_`, `NETWORKS_`, `CRON_`, `COOKIE_`, `KEYCLOAK_`, `TRUSTED_`) or a removed variable stops the API, with every problem listed.

Booleans accept `true`, `1`, `yes`, `on` and `false`, `0`, `no`, `off`. Lists are comma-separated.

## Core {#core}

| Variable | Default | Description |
|---|---|---|
| `FRONT_URL` | required | URL of the web interface: the only origin allowed by CORS, the CSRF check and the WebSocket. Users are sent there after login |
| `COOKIE_SECRET` | required | Secret signing the session cookies, at least 32 characters |
| `PASSWORD_SECRET` | required | Must be set; not used by the current version |
| `COOKIE_DOMAIN` | host of the API | Domain of the session cookies |
| `APP_ENV` | `production` | `development` enables debug logs |
| `PORT` | `2538` | Listen port (1 to 65535) |
| `DATA_DIR` | `./data` | Users, API keys, scheduled tasks, networks registry (JSON files). `/app/data` in the image |
| `API_LOG_DIR` | `./log` | Directory of `audit.log`. `/app/log` in the image: mount it to keep the trail |
| `TRUSTED_PROXIES` | empty (loopback only) | Reverse proxies allowed to set `X-Forwarded-For`: CIDRs or addresses. The loopback is always trusted. A range wider than /8 (IPv4) or /32 (IPv6) is refused |

## Authentication (OIDC) {#oidc}

| Variable | Default | Description |
|---|---|---|
| `OIDC_PROVIDER` | `microsoft` | `microsoft`, `keycloak` or `generic` |
| `CLIENT_ID` | required | OAuth 2.0 client ID |
| `CLIENT_SECRET` | required | OAuth 2.0 client secret |
| `REDIRECT_URI` | required | Public URL of the API; the callback is `<REDIRECT_URI>/openid-connect/redirect` |
| `SCOPE` | required | OAuth scopes, for example `openid email profile` |
| `TENANT_ID` | required with `microsoft` | Microsoft Entra ID tenant |
| `APPLICATION_ID` | required with `microsoft` | Microsoft Entra ID application |
| `KEYCLOAK_URL` | required with `keycloak` | Keycloak base URL |
| `KEYCLOAK_REALM` | required with `keycloak` | Keycloak realm |
| `OIDC_DISCOVERY_URL` | required with `generic` | Discovery URL (`.well-known/openid-configuration`) of any standard OIDC provider |

## Scheduled tasks {#cron}

| Variable | Default | Description |
|---|---|---|
| `CRON_HTTP_TIMEOUT` | `900` | Maximum duration of an HTTP scheduled task, in seconds (1 to 86400) |
| `CRON_MAX_JOBS` | `50` | Maximum number of scheduled tasks (1 to 10000) |

## Private networks {#networks}

| Variable | Default | Description |
|---|---|---|
| `NETWORKS_MAX` | `50` | Maximum number of private networks, the system network not counted (1 to 500) |
| `NETWORKS_RESERVED_RANGES` | empty | IPv4 ranges (at least /8) used outside Docker (LAN, VPN, static routes) that no private network may overlap |

See [Private networks](../admin/networks.md).

## Websites (hosting) {#hosting}

| Variable | Default | Description |
|---|---|---|
| `HOSTING_ENABLED` | `false` | Enables the websites module |
| `HOSTING_STACKS_DIRECTORY` | `/data/compose` | Compose projects directory (may be shared with CI stacks). Also used by the services module. Same path on the host and in the API container |
| `HOSTING_SITES_DIRECTORY` | `/data/websites/hosted` | Site data directory. Same path on the host and in the API container |
| `HOSTING_TRAEFIK_NETWORK` | required when enabled | External Docker network joined by the web services |
| `HOSTING_TRAEFIK_HTTP_ENTRYPOINT` | `web` | Traefik HTTP entrypoint |
| `HOSTING_TRAEFIK_HTTPS_ENTRYPOINT` | `websecure` | Traefik HTTPS entrypoint |
| `HOSTING_TRAEFIK_CERTRESOLVER` | `letsencrypt` | Traefik certificate resolver (empty: default certificate) |
| `HOSTING_RUN_UID` | `1000` | Owner of the site directories created by the panel |
| `HOSTING_RUN_GID` | `1000` | Group of the site directories created by the panel |
| `HOSTING_DEFAULT_MEMORY_MB` | `0` | Default memory limit of a site, in MB (`0`: unlimited, otherwise at least 64) |
| `HOSTING_MAX_MEMORY_MB` | `0` | Highest memory limit a site may request, in MB (`0`: the host memory, otherwise at least 64; capped to the host) |
| `HOSTING_DEFAULT_CPUS` | `0` | Default CPU limit of a site (`0`: unlimited, otherwise at least 0.1) |
| `HOSTING_MAX_CPUS` | `0` | Highest CPU limit a site may request (`0`: the host CPUs, otherwise at least 0.1; capped to the host) |

A default above its maximum stops the API. See [Websites](../admin/hosting.md).

## SFTP {#sftp}

| Variable | Default | Description |
|---|---|---|
| `SFTP_ENABLED` | `false` | Enables the SFTP module (SFTPGo) |
| `SFTP_DIRECTORY` | required when enabled | Base directory of the sites |
| `SFTP_API_URL` | required when enabled | Internal URL of the SFTPGo admin API, for example `http://sftpgo:8080` |
| `SFTP_API_KEY` | required when enabled | SFTPGo admin API key |
| `SFTP_DOMAIN` | empty | SFTP host shown to users |
| `SFTP_PORT` | empty | SFTP port shown to users |
| `SFTP_WEB_USER_INTERFACE` | empty | URL of the SFTPGo web client shown to users |
| `SFTP_INIT_DIRS` | `web,logs` | Directories created in the home of a new user when requested (empty: none) |

See [SFTP](../admin/sftp.md).

## Managed services {#services}

| Variable | Default | Description |
|---|---|---|
| `SERVICES_ENABLED` | `false` | Enables the managed services module |
| `SERVICES_DATA_DIRECTORY` | `/data/services` | Data of the instances. Absolute path, same on the host and in the API container, outside the stacks, sites and SFTP directories |
| `SERVICES_NETWORK` | `loch-services` | Docker name of the system network `services`, shared by the instances and the sites (created `internal` if missing). Not `bridge`, `host`, `none`, `default`, the Traefik network nor a `loch-net-*` name |
| `SERVICES_ENGINES` | empty (all) | Enabled engines: `postgres`, `mariadb`, `mysql`, `mongodb`, `redis`, `valkey`, `rabbitmq`, `nats`, `s3`, `elasticmq`, `mosquitto` |
| `SERVICES_<ENGINE>_PINNED_VERSIONS` | empty | Versions always offered at creation, even out of support, for example `SERVICES_MYSQL_PINNED_VERSIONS=5.6`. One variable per engine |
| `SERVICES_UPDATE_CHECK_INTERVAL` | `12` | Hours between two discoveries of versions and updates (0 to 168; `0`: on demand only) |
| `SERVICES_MAX_RESOURCES_PER_INSTANCE` | `50` | Resources per shared instance (1 to 500) |
| `SERVICES_MAX_DEDICATED_INSTANCES` | `20` | Dedicated instances per engine (1 to 200) |
| `SERVICES_ARCHIVE_ON_RETIRE` | `false` | Rename the data of a removed instance instead of deleting it |
| `SERVICES_EXPOSE_ALLOWED_CIDRS` | `127.0.0.1` | Host addresses a port may be published on: CIDRs or addresses. `0.0.0.0` must be listed alone |
| `SERVICES_ALLOW_PUBLIC_BIND` | `false` | Required for any non-loopback address in `SERVICES_EXPOSE_ALLOWED_CIDRS` |
| `SERVICES_TLS` | `auto` | `auto`: TLS required once an instance is published outside the loopback; `off`: TLS disabled |
| `SERVICES_ALLOW_TLS_OPTIONAL` | `false` | Lets an exposure offer TLS without requiring it (PostgreSQL, MySQL 8.4, MariaDB) |
| `SERVICES_PUBLIC_HOST` | empty | Host name or IP shown to clients and covered by the certificates (no scheme, no path) |
| `SERVICES_TLS_CERT_FILE` | empty | Certificate to use instead of self-signed ones. Set together with the key |
| `SERVICES_TLS_KEY_FILE` | empty | Key of that certificate |
| `SERVICES_S3_ADMIN_API_KEY` | empty | Empty: one Loch S3 instance per resource (the only mode available). Set: shared mode, not available yet, the `s3` engine is disabled |

Version discovery needs outbound HTTPS to `registry-1.docker.io`, `auth.docker.io`, `ghcr.io`, `mirror.gcr.io` and `endoflife.date`. See [Managed services](../admin/services.md).

## Removed variables {#removed}

The API refuses to start while one of these is set, and says what replaces it.

| Variable | Replaced by |
|---|---|
| `SERVICES_EXPOSED_PORTS`, `SERVICES_PUBLISH_ADDRESS` | Ports chosen in the panel, within `SERVICES_EXPOSE_ALLOWED_CIDRS` |
| `SERVICES_TLS_OPTIONAL` | Optional TLS chosen per exposure, allowed by `SERVICES_ALLOW_TLS_OPTIONAL` |
| `SERVICES_<ENGINE>_VERSIONS` | Versions discovered on the registries; `SERVICES_<ENGINE>_PINNED_VERSIONS` |

## Docker connection {#docker}

The API connects to Docker with the standard Docker client environment (`DOCKER_HOST` and related variables). Without them, it uses the local socket `/var/run/docker.sock`.

## Interface {#interface}

The web interface container has its own variables (`API_URL`, `WS_URL`, `APP_NAME`, `LOGO_URL`, `FAVICON_URL`, `SUPPORT_PHONE`, `SUPPORT_URL`, `STATUS_URL`): see [Installation](../admin/installation.md#interface-settings).
