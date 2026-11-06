---
sidebar_position: 1
title: Installation
description: Deploy the Loch Panel API and web interface with Docker, connect an OIDC provider and log in as the first admin.
---

# Installation

Loch Panel runs as two containers: the **API** (Go, port 2538), which talks to the Docker daemon, and the **interface** (nginx, port 80), a static web app that calls the API.

:::note Prerequisites
- A Linux server with Docker and `docker compose`.
- An OIDC provider: Microsoft Entra ID, Keycloak, or any standard OIDC provider (Authentik, Authelia, Zitadel, Auth0, Okta, Google, GitLab…).
- Two HTTPS URLs, for example `https://panel.example.com` (interface) and `https://panel-api.example.com` (API).
:::

## 1. Build the images

Each project ships a multi-stage Dockerfile. Base images are pulled from `mirror.gcr.io`.

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

## 2. Register the OIDC client

In your provider, create an OAuth 2.0 client (Authorization Code flow with PKCE):

1. Set the redirect URI to `<API URL>/openid-connect/redirect`, for example `https://panel-api.example.com/openid-connect/redirect`.
2. Allow the scopes `openid email profile`.
3. Write down the client ID and secret, plus the provider settings below.

| `OIDC_PROVIDER` | Also set |
|---|---|
| `microsoft` (default) | `TENANT_ID`, `APPLICATION_ID` |
| `keycloak` | `KEYCLOAK_URL`, `KEYCLOAK_REALM` |
| `generic` | `OIDC_DISCOVERY_URL` (the `.well-known/openid-configuration` URL) |

The ID token must carry an `email` (or `preferred_username`) claim: it identifies the user.

## 3. Write the API configuration

Create a `.env` file next to your compose file:

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

## 4. Start the containers

```yaml
services:
  api:
    image: loch-panel-api
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
    image: loch-panel-interface
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

The API exposes a health check on `/_health` (also used by the image `HEALTHCHECK`). It answers `{"message":"up","docker":true}` when Docker is reachable.

## 5. Log in as the first admin

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

## Reverse proxy

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
- Optional modules: [Websites](./hosting.md), [SFTP](./sftp.md), [Managed services](./services.md), [Private networks](./networks.md).
