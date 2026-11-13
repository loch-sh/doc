---
sidebar_position: 1
title: Installation
description: Install Loch Panel with a ready-made Docker Compose stack (web, light, minimal) or by hand, connect an OIDC provider and log in as the first admin.
---

# Installation

Loch Panel runs as two containers: the **API** (Go, port 2538), which talks to the Docker daemon, and the **interface** (nginx, port 80), a static web app that calls the API.

There are two ways to install it:

- **[With Docker Compose](#docker-compose)** (recommended): a ready-made stack from the panel repository, started with one script.
- **[By hand](#manual)**: your own compose file and reverse proxy.

:::note Prerequisites
- A Linux server with Docker and `docker compose`. For a local test, macOS with Docker Desktop or OrbStack works too.
- An OIDC provider: Microsoft Entra ID, Keycloak, or any standard OIDC provider (Authentik, Authelia, Zitadel, Auth0, Okta, Google, GitLab…).
:::

## Register the OIDC client {#oidc}

In your provider, create an OAuth 2.0 client (Authorization Code flow with PKCE):

1. Set the redirect URI to `<API URL>/openid-connect/redirect`. With the Docker Compose examples, it is `https://manager.api.<DOMAIN>/openid-connect/redirect`. With Entra ID, add it under the **Web** platform, not **SPA**.
2. Allow the scopes `openid email profile`.
3. Write down the client ID and secret, plus the provider settings below.

| `OIDC_PROVIDER` | Also set |
|---|---|
| `microsoft` (default) | `TENANT_ID`, `APPLICATION_ID` |
| `keycloak` | `KEYCLOAK_URL`, `KEYCLOAK_REALM` |
| `generic` | `OIDC_DISCOVERY_URL` (the `.well-known/openid-configuration` URL) |

The ID token must carry an `email` (or `preferred_username`) claim: it identifies the user.

## Install with Docker Compose {#docker-compose}

The [`example/`](https://github.com/loch-sh/panel/tree/main/example) folder of the panel repository holds four stacks, all behind Traefik with Let's Encrypt:

| Example | Services | Use it when |
|---|---|---|
| `web` | Traefik, panel (hosting, SFTP and services on), SFTPGo, [deploy-server](/deploy/) | Web agency hosting: sites created in the panel, files over SFTP, managed databases, GitLab CI deployments |
| `light` | Traefik, panel (plugins off), deploy-server | Stacks are deployed by GitLab CI only |
| `minimal` | Traefik, panel (plugins off) | Stacks are deployed by other means (by hand, over SSH) |
| `web-build` | `web`, with the API and the interface built from the local sources | Testing a change of the panel in a full stack. **Not for production.** |

Each example has the same files: `compose.yaml` (never edit it), `.env.example`, `app.env.example` and `up.sh`. The panel images are `ghcr.io/loch-sh/panel/api` and `ghcr.io/loch-sh/panel/interface`, each pinned to its own release (API `v1.1.0`, interface `v1.1.1`).

### 1. Configure

```bash
git clone https://github.com/loch-sh/panel.git
cd panel/example/web                                # or light, minimal, web-build
cp .env.example .env && cp app.env.example app.env
```

- **`.env`**: `DOMAIN`, `ACME_EMAIL`, `DATA_ROOT` (default `/data`) and, with deploy-server, `GITLAB_HOST`, `DEPLOY_NAMESPACES`, `DEPLOY_ALLOWED_IPS`.
- **`app.env`**: the [OIDC client](#oidc), `COOKIE_SECRET` and `PASSWORD_SECRET` (generate each with `openssl rand -hex 32`).

Every public host is a subdomain of `DOMAIN`. In production, set a real domain whose DNS records point to the server: `manager`, `manager.api`, and with `web` or `light` also `deploy` and `ftp`. The default, `127.0.0.1.traefik.me`, is for a [local run](#local-run).

:::warning
Leave `FRONT_URL` and `REDIRECT_URI` in `app.env` as they are: they derive from `DOMAIN`. If they do not match the real URLs, CORS blocks the interface: the page stays blank and `/users/me` answers 401.
:::

On a Linux server, create the host directories first (the paths are in each example's README). For `web`, the sites belong to `1000:1000`:

```bash
sudo mkdir -p /data/{traefik/letsencrypt,traefik/logs,panel/data,panel/log,compose,websites/hosted,services,deploy} \
  /data/sftpgo/{data,logs,config}
sudo chown -R 1000:1000 /data/sftpgo /data/websites/hosted
```

### 2. Start

```bash
./up.sh
docker compose logs -f api    # the API lists every configuration problem at startup
```

`up.sh`:

1. checks that `.env` and `app.env` exist;
2. creates the shared `traefik_default` network if it is missing (hosted sites and CI stacks use it too, so `docker compose down` never removes it);
3. on macOS, uses `./data` when `DATA_ROOT` is not set;
4. with `web`, when `SFTP_ENABLED=true` and `SFTP_API_KEY` is empty, [creates the SFTPGo API key](#sftpgo-key);
5. runs `docker compose up -d` (extra arguments are passed on, for example `./up.sh api`), then prints the URLs:

| URL | Service |
|---|---|
| `https://manager.<DOMAIN>` | Interface |
| `https://manager.api.<DOMAIN>` | API |
| `https://deploy.<DOMAIN>` | deploy-server |
| `sftp://ftp.<DOMAIN>:2022`, `https://ftp.<DOMAIN>/web/client` | SFTP and its web client |
| `http://127.0.0.1:8081/web/admin` | SFTPGo admin, on the host loopback only (remote: `ssh -L 8081:127.0.0.1:8081 <host>`) |

Then [log in as the first admin](#first-admin).

### SFTPGo API key {#sftpgo-key}

The SFTP plugin needs an SFTPGo admin API key, and the API refuses to start without it. The SFTPGo web admin has no "API keys" page: the key is created with the REST API. Let `up.sh` do it:

1. `up.sh` starts SFTPGo alone and asks `Create a new SFTPGo admin API key now? [y/N]`.
2. If not done yet, open `http://127.0.0.1:8081/web/admin` and create the SFTPGo admin.
3. Answer `y`, then type the admin's username and password (not shown).

`up.sh` enables **API key authentication** on the admin's profile, creates the key and writes it to `SFTP_API_KEY` in `app.env`, then starts the stack. On "no", or without a terminal, it prints the manual steps instead: they are in the [`web` README](https://github.com/loch-sh/panel/tree/main/example/web#installation).

### Local run {#local-run}

With the default `DOMAIN=127.0.0.1.traefik.me`, the stack runs on your machine without any DNS record: every `<x>.127.0.0.1.traefik.me` resolves to `127.0.0.1`.

- Let's Encrypt cannot validate these hosts: Traefik serves a self-signed certificate. **Open `https://manager.api.127.0.0.1.traefik.me` once and accept the certificate**, then open the interface. Until then the browser blocks the API calls and the interface stays blank.
- On macOS, `/data` cannot be shared with the Docker VM: without `DATA_ROOT`, `up.sh` uses `./data`.
- To reach the stack from another device, use your LAN IP, for example `DOMAIN=192.168.1.20.traefik.me`.

### Good to know

- **One example per host.** They use the same ports, networks and directories. `web` and `web-build` share their data: switching between them keeps users, sites and service instances.
- **HTTP to HTTPS** is redirected by a catch-all Traefik router of priority 1, not by the entrypoint. A hosted site with HTTPS off is therefore served over HTTP.
- **Upgrades**: change the image tag in `compose.yaml` on each [release](https://github.com/loch-sh/panel/releases), after reading its notes.
- **`web-build`** rebuilds the API and the interface from the sources on every `./up.sh` (`pull_policy: build`). `./up.sh api` or `./up.sh interface` rebuilds only one of them.
- Network layout, host directories and security notes: see the [examples README](https://github.com/loch-sh/panel/tree/main/example).

## Install by hand {#manual}

Use this path to integrate the panel into an existing reverse proxy.

### 1. Get the images

Use the published images, `ghcr.io/loch-sh/panel/api:v1.1.0` and `ghcr.io/loch-sh/panel/interface:v1.1.1`, or build them: each project ships a multi-stage Dockerfile, with base images pulled from `mirror.gcr.io`.

```bash
# In host-panel-api/
docker build -t loch-panel-api .

# In host-panel-interface/
docker build -t loch-panel-interface .
```

| Image | Base | Port | Volumes |
|---|---|---|---|
| API | `mirror.gcr.io/library/alpine` (includes `docker-cli` and the compose plugin) | 2538 | `/app/data`, `/app/log` |
| Interface | `mirror.gcr.io/library/nginx` | 80 | `/branding` |

### 2. Write the API configuration

Register the [OIDC client](#oidc), then create a `.env` file next to your compose file:

```env
OIDC_PROVIDER=generic
OIDC_DISCOVERY_URL=https://auth.example.com/.well-known/openid-configuration
CLIENT_ID=loch-panel
CLIENT_SECRET=change-me
REDIRECT_URI=https://panel-api.example.com
SCOPE=openid email profile

FRONT_URL=https://panel.example.com
COOKIE_SECRET=a-random-secret-of-at-least-32-characters
PASSWORD_SECRET=required-but-not-used-yet
```

`REDIRECT_URI` is the public URL of the API, without the callback path. Every variable is checked at startup: see [Configuration](./configuration.md).

### 3. Start the containers

```yaml
services:
  api:
    image: ghcr.io/loch-sh/panel/api:v1.1.0
    restart: unless-stopped
    env_file: .env
    ports:
      - "2538:2538"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./data:/app/data   # users, API keys, scheduled tasks
      - ./log:/app/log     # audit trail
      # Hosting and services: same path on the host and in the container
      # - /data/compose:/data/compose
      # - /data/websites/hosted:/data/websites/hosted

  interface:
    image: ghcr.io/loch-sh/panel/interface:v1.1.1
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      API_URL: https://panel-api.example.com
      WS_URL: wss://panel-api.example.com
```

```bash
docker compose up -d
```

The API exposes a health check on `/_health` (also used by the image `HEALTHCHECK`). It answers `{"message":"up","docker":true}` when Docker is reachable. Put both containers behind an HTTPS [reverse proxy](#reverse-proxy).

## Log in as the first admin {#first-admin}

Open the interface and log in. **The first user to log in becomes admin.** Every later user is created at their first login with the restricted profile and no container. Grant them access in [Users](./users.md).

## Interface settings {#interface-settings}

All optional, read when the container starts (no rebuild).

| Variable | Default | Description |
|---|---|---|
| `API_URL` | `http://localhost:2538` | Base URL of the API |
| `WS_URL` | `ws://localhost:2538` | Base URL of the API WebSocket (logs, terminal, proxy) |
| `APP_NAME` | `Loch.sh Panel` | Name shown in the browser tab and terminal windows |
| `LOGO_URL` | `/logo.svg` | Logo URL; overrides a logo mounted in `/branding` |
| `FAVICON_URL` | the logo, else `/favicon.svg` | Favicon URL |
| `SUPPORT_PHONE` | — | Support phone on the home page (hidden when empty) |
| `SUPPORT_URL` | — | Support link on the home page (hidden when empty) |
| `STATUS_URL` | — | Status page embedded on the home page (hidden when empty) |

To use your own logo, mount `logo.svg` (or `.png`, `.webp`, `.jpg`, `.jpeg`, `.ico`) and optionally `favicon.*` into `/branding`.

## Reverse proxy {#reverse-proxy}

Put both containers behind an HTTPS reverse proxy (Traefik, nginx…):

- **HTTPS is required.** The session cookie is `Secure` and `SameSite=None`.
- **WebSocket**: the proxy must forward the upgrade on the API route `/ws` (terminal, live logs, stats, port proxy). Use `wss://` in `WS_URL`.
- **Origin**: `FRONT_URL` must be exactly the interface URL (scheme, host, port). It is the only origin allowed by CORS, the CSRF check and the WebSocket.
- **Client IP**: set `TRUSTED_PROXIES` to the subnet of the proxy, for example the Traefik network (`docker network inspect traefik`). Without it, the rate limit and the audit trail see the proxy address.
- **Cookie domain**: `COOKIE_DOMAIN` defaults to the API host. Change it only if you know you need to.

## Good to know

- The API needs the Docker socket: anyone who controls the API container controls the host. Do not expose port 2538 without the reverse proxy.
- Mount `/app/log`, or the audit trail is lost when the container is recreated.
- Hosting and services directories must be bind-mounted at the **same path** in the API container as on the host; the API checks it at startup.
- The panel pulls the images it runs (sites, services) from `mirror.gcr.io`; the services module also needs outbound HTTPS to discover versions (see the [Configuration reference](../reference/configuration.md#services)).
- Optional modules: [Websites](../hosting/sites.md), [SFTP](../hosting/sftp.md), [Managed services](../services/overview.md), [Private networks](../network/private-networks.md).
