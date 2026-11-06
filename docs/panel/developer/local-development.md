---
sidebar_position: 2
title: Local development
description: Run the Loch Panel API, the web interface and SFTPGo on your machine.
---

# Local development

Run the API and the interface from the workspace directory that holds the three projects.

:::note
You need Go 1.27 or later, Node.js 26 and Yarn 4 (`corepack enable`), Docker with `docker compose`, and an OIDC provider (Microsoft Entra ID, Keycloak or any compliant provider).
:::

## Start

1. Install the dependencies of the API and the interface:

   ```bash
   make install
   ```

2. Create the API configuration, then set the OIDC client, `FRONT_URL` and the secrets:

   ```bash
   cp host-panel-api/.env.example host-panel-api/.env
   ```

3. Optional: create the interface configuration (API URL, branding):

   ```bash
   cp host-panel-interface/.env.example host-panel-interface/.env
   ```

4. Start SFTPGo, then the API and the interface:

   ```bash
   make dev
   ```

5. Open http://localhost:5173 and log in.

## API `.env` for development

The values below come from `.env.example`. Full list: [Configuration reference](../reference/configuration.md).

```env
OIDC_PROVIDER=microsoft          # microsoft, keycloak or generic
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
REDIRECT_URI=http://localhost:2538
FRONT_URL=http://localhost:5173
COOKIE_SECRET=a-secret-of-at-least-32-characters-here
APP_ENV=development
PORT=2538
DATA_DIR=./data
```

The API refuses to start on an invalid, missing, unknown or removed variable, and lists every problem at once.

## Workspace targets

| Target | Description |
|---|---|
| `make dev` | SFTPGo, then the API and the interface in parallel. Ctrl-C stops the API and the interface |
| `make api` / `make web` | The API only / the interface only |
| `make sftpgo` / `make sftpgo-logs` / `make down` | Start SFTPGo / follow its logs / stop it |
| `make install` | Install the dependencies |
| `make clean` | Stop SFTPGo and delete its local data |

In the API directory, `make dev` runs `go run ./cmd/server` without reload: restart it after a change. The interface (`yarn dev`) reloads on its own.

## Ports

| Service | URL |
|---|---|
| API | http://localhost:2538 |
| Interface | http://localhost:5173 |
| SFTPGo web admin and API | http://localhost:8080 |

## Enable SFTP in development

1. Run `make sftpgo` (or `make dev`).
2. Create an SFTPGo admin API key: `cd host-panel-api && make sftp-key`. It asks for the SFTPGo admin password and needs `curl` and `jq`.
3. Add to `host-panel-api/.env`:

   ```env
   SFTP_ENABLED=true
   SFTP_DIRECTORY=/data/websites/hosted
   SFTP_API_URL=http://localhost:8080
   SFTP_API_KEY=<the admin API key>
   SFTP_DOMAIN=localhost
   SFTP_PORT=2222
   SFTP_WEB_USER_INTERFACE=http://localhost:8080/web/client
   ```

4. Restart the API: the **SFTP** menu entry appears for admins.

## The CLI

The CLI is built separately, in `host-panel-cli`:

| Command | Description |
|---|---|
| `make build` | Build `./loch` (version `dev`, so auto-update is skipped) |
| `make run` | `go run .` |
| `make mcp-inspect` | Open the MCP inspector on `loch mcp` |

Point it to your local API with an API key created in the interface. See the [CLI documentation](/cli/).

## Good to know

- The API needs access to the Docker socket.
- `.env` files are not tracked: only `.env.example` is.
- Your OIDC client must allow the `REDIRECT_URI` you set.
