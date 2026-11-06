---
sidebar_position: 1
title: Architecture
description: The Go packages of deploy-server and the path of a request through its middleware and handlers.
---

# Architecture

`deploy-server` is a single Go binary using `net/http`, `log/slog`, `go-oidc` and `yaml.v3`. Every docker call is an argument slice passed to `exec.CommandContext`, never a shell.

## Request path

Middleware wrap each protected endpoint, outer to inner (`main.go`, `newMux`):

1. Audit (`middleware/audit.go`): one entry per request, refusals included.
2. IP allowlist (`middleware/ipallow.go`): `403`.
3. Token verification (`middleware/oidc.go`): `401`.
4. Namespace allowlist (`middleware/authz.go`): `403`.
5. Protected-environment rule (`middleware/authz.go`): `403`.
6. Handler: stack identity, ownership, input validation, operation.

## Packages

| Package | Role |
|---|---|
| `main.go` | Startup, flags (`-version`, `-import-registry`), routes, HTTP limits, graceful shutdown |
| `config` | Environment variables and their validation |
| `middleware` | OIDC verification, authorization rules, IP allowlist with proxy-aware client IP, audit |
| `handlers` | Endpoints; stack identity from claims (`stack.go`), per-stack lock (`lock.go`), pre-deploy check (`legacy.go`), validation helpers (`validate.go`) |
| `compose` | Docker runner (`-p` pinning, timeouts, output caps, 4-slot semaphore), container inspection and removal, deployment policy |
| `registry` | Ownership store, collision detection, import |
| `scheduler` | Auto-stop loop (startup, then every 5 minutes) |
| `internal/slug` | GitLab slugification shared by config, middleware and handlers |
| `internal/atomicfile` | Atomic, fsynced file writes |
| `internal/testutil` | Fake `docker` binary and fake GitLab OIDC issuer for tests |

## Design choices

- Identity is derived from signed claims; the request never names a stack.
- Validation happens in a staging directory, so a refused deploy leaves the running stack untouched.
- The policy is a deny-list over the compose model: review it at every Compose upgrade.
- `/directories` goes through an `os.Root` confined to `WEBSITES_BASE/<key>`.
- The server runs as root on purpose; see [Security model](../admin/security.md).
