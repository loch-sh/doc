---
sidebar_position: 4
title: Conventions
description: "The rules to follow when you change the Loch Panel code: images, languages, translations, configuration and security."
---

# Conventions

Follow these rules in every change to the API, the interface or the CLI.

## Docker images

| Rule | Detail |
|---|---|
| Pull from `mirror.gcr.io`, never from Docker Hub directly | `mirror.gcr.io/library/<name>` for official images, `mirror.gcr.io/<org>/<name>` for the others |
| In Go, build references with the helpers | `registry.Hub("postgres:17")`; `registry.GHCR(...)` for our own images (Loch S3), the only other exception |
| Image missing from the mirror | Stays on Docker Hub, listed in `notMirrored` (`internal/hosting/catalog.go`) |

This applies to engine catalogs, site templates, Dockerfiles, CI jobs, the development compose file and integration tests.

## Languages

| What | Language |
|---|---|
| Code, identifiers, technical comments | English |
| API errors, logs, CLI help and messages | English |
| Interface texts | Translated in all 10 languages, English is the source. See [Translations](./translations.md) |

## API

- Answer with `writeJSON` / `writeError` and a stable error code (`{"code": "...", "error": "..."}`). The interface translates the code (`errors` namespace).
- Read every environment variable through an `env.Reader`, never `os.Getenv`, so the startup lint sees it. Add a new variable to `config.go` and `.env.example`; declare a removed one with `Reader.Removed`; add a new prefix to `lintedPrefixes` (`internal/config`). Never put a value in a lint message.
- Stores write atomically (temporary file, then rename) behind a read-write lock.
- Audit anything a user can trigger, never with a secret (password, token, header, body). Add every new audit event to `AUDIT_EVENTS` (`Services/Audit/Models/audit.model.ts`) and translate it in all 10 languages.
- A new service engine: follow "Adding a service engine" in `host-panel-api/docs/development.md`, read `docs/services-security.md` first, and add an integration test.

## Interface

- No hardcoded visible string: everything goes through `t()`.
- Read `import.meta.env` only in `src/config.ts`.
- Never display raw Docker `State` / `Status`: use `useContainerLabels()`.
- Load pages with `lazyPage` and keep them inside the `ErrorBoundary`.
- Add every new API call to the mocked API (`tests/mocks/api.ts`). See [Testing](./testing.md).

## Security rules worth knowing

| Rule | Why |
|---|---|
| A new route that reads or changes data checks an API key scope (`middleware.RequireScope`); a new scope goes in `ValidScopes` (`internal/model/apikey.go`) | Keys can be limited; a session always has every permission of its user |
| Write routes stay on POST, PUT, PATCH or DELETE | `SameOrigin(FRONT_URL)` blocks browser writes from another origin (CSRF, the session cookie is `SameSite=None`) |
| Validate container paths on the API side (absolute, no null or newline, at most 4096 characters) | File copy and file tail run inside containers |
| Pass commands to `docker exec` as `[]string`, never through a shell | No injection |
| Never act on the API's own container (shell, copy, file tail, exec jobs) | It holds the audit trail (`SELF_CONTAINER_PROTECTED`) |
| Every value rendered into a configuration comes from a fixed list or a validated identifier | Templates and compose files are executed |
| Show a generated token or password only once, never log it | API key tokens are stored as SHA-256 hashes only |

Full list of scopes: [API key scopes](../reference/scopes.md).

## Good to know

- Document every feature in `host-panel-api/docs/` as well.
- Each project is a separate Git repository.
