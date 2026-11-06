---
sidebar_position: 1
title: Architecture
description: The three Loch Panel projects, how they talk to each other and the main packages of each.
---

# Architecture

Loch Panel is made of three projects, each in its own Git repository, grouped in one workspace directory.

| Project | Role | Stack |
|---|---|---|
| `host-panel-api` | REST and WebSocket API, drives Docker (port 2538) | Go 1.27, standard `net/http`, Moby Docker SDK |
| `host-panel-interface` | Web interface (port 5173 in development), in 10 languages | React 19, TypeScript, Vite, Ant Design 6, TanStack Query |
| `host-panel-cli` | [`loch` CLI](/cli/) and MCP server | Go, Cobra, Viper |

## How the projects talk

| From | To | Channel | Authentication |
|---|---|---|---|
| Interface | API | REST (Axios, `withCredentials: true`) | Session cookie |
| Interface | API | WebSocket `/ws`: shell, live logs, live stats | Session cookie |
| CLI | API | REST and WebSocket `/ws` (also the TCP port proxy) | `X-API-Key` header |
| API | Docker | Docker socket | — |
| API | SFTPGo | SFTPGo admin REST API (when `SFTP_ENABLED`) | `X-SFTPGO-API-KEY` header |

**Session (browser).** The API runs the OIDC login itself (`/openid-connect/login`, then `/openid-connect/redirect`). It stores the token in a signed `authorization` cookie and checks it against the provider's JWKS on each request. When the API answers `401`, the interface redirects to `/openid-connect/login`. A session has every permission of its user.

**API key (CLI, scripts, MCP).** The `X-API-Key` header is checked first. A key carries its user's profile and can be limited by scopes. See [API reference](../reference/api.md).

## Request path in the API

1. Global middlewares, in this order: `Recovery`, `Logging`, `AuditRequests`, `RateLimit` (120 requests per minute per IP), `SecurityHeaders`, `CORS(FRONT_URL)`, `SameOrigin(FRONT_URL)` (CSRF).
2. Route wrapper: `authenticated` (API key, otherwise JWT and user) or `adminOnly` (the same, plus the admin check). Routes are declared in `cmd/server/main.go`.
3. Handler: checks the API key scope with `middleware.RequireScope`, then answers with `writeJSON` / `writeError`.

## API packages

| Package | Role |
|---|---|
| `cmd/server` | Entry point: configuration, wiring, routes, service engine registration (`serviceEngines()`) |
| `internal/config`, `internal/env` | Environment loading, validation and lint |
| `internal/auth` | OIDC providers, JWKS, signed cookies |
| `internal/middleware` | Authentication, CSRF, CORS, rate limit, audit, logging |
| `internal/handler` | HTTP and WebSocket handlers, error codes |
| `internal/ws` | WebSocket hub: logs, shell, stats, port proxy |
| `internal/docker` | Docker client, container cache (3 s), exec, networks |
| `internal/store`, `internal/model` | Atomic JSON persistence; users, API keys |
| `internal/cron` | Scheduled tasks: scheduler, executor, store |
| `internal/audit` | Audit log writer and reader |
| `internal/hosting`, `internal/composekit` | Web hosting; helpers to write and run compose projects |
| `internal/sftpgo` | SFTPGo admin client |
| `internal/services` | Managed services core; one sub-package per engine (`postgres`, `mysqlfamily`, `mongodb`, `redisfamily`, `nats`, `rabbitmq`, `elasticmq`, `mosquitto`, `s3`) |
| `internal/networks` | Private networks: registry, verification, members |
| `internal/registry`, `internal/releases` | Image references (`mirror.gcr.io`, `ghcr.io`); version discovery |

The API stores its state in JSON files under `DATA_DIR` (`users.json`, `apikeys.json`, `cron.json`, `networks.json`) and writes the audit trail to `audit.log` in its log directory.

## Interface structure

| Path | Content |
|---|---|
| `src/config.ts` | Runtime configuration: `window.__APP_CONFIG__`, then `VITE_*` variables, then defaults |
| `src/i18n/` | i18next setup, typed keys, locale files |
| `src/Services/<Area>/` | API calls (`service.ts`), models, React Query hooks |
| `src/Pages/<Area>/` | One folder per page |
| `src/Components/` | Shared components; menu in `Components/Layout/MenuLayout.tsx` |
| `src/App.tsx` | Routes |
| `tests/` | Mocked API, Vitest setup, Playwright tests |

## Good to know

- Each project has its own Git repository: commit in the project you changed.
- The CLI has no access to Docker: everything goes through the API.
- The detailed design notes stay in the API repository (`host-panel-api/docs/`).
