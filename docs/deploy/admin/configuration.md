---
sidebar_position: 1
title: Configuration and hardening
description: Set the essential Loch Deploy variables and check the eleven deployment assumptions the security model depends on.
---

# Configuration and hardening

All settings are environment variables. There is no configuration file. An invalid value makes the server exit at startup with status `1`.

## Essential variables

| Variable | Example | Why |
|---|---|---|
| `GITLAB_ISSUER` | `https://gitlab.example.com` | Required. The server fetches the token keys from it, over HTTPS only |
| `GITLAB_AUDIENCE` | `https://deploy.example.com` | Required. Must equal `aud` in the jobs' `id_tokens` |
| `ALLOWED_NAMESPACES` | `apps/atmosphere,infra` | Only these groups and their sub-groups may deploy. Empty = every project of the instance |
| `ALLOWED_IPS` | CI runner egress IPs | Other clients get `403`. Empty = disabled |
| `TRUSTED_PROXIES` | `172.31.250.2` | Traefik's exact IP, so the client IP is read from `X-Forwarded-For` |
| `FORBIDDEN_TRAEFIK_HOSTS` | `deploy.example.com,gitlab.example.com` | Hosts no stack may route |
| `ALLOWED_EXTERNAL_NETWORKS` | `web` | The only external network stacks may join |
| `PROTECTED_ENVS` | `production` (default) | These environments require a protected branch or tag |

Every variable, default and validation: [Configuration reference](../reference/configuration.md).

## Hardening checklist

These are preconditions of the security model, not recommendations.

1. **Private GitLab.** Anyone who can run a pipeline under an allowed namespace can deploy containers on the host. With open sign-up, every user owns a namespace.
2. **`ALLOWED_NAMESPACES` is set.** Empty, it accepts every project of the instance (a warning is logged at startup).
3. **Legacy stacks are imported** with `-import-registry` before pipelines can call the server. Otherwise the first deploy that reaches an unclaimed key takes it over. See [Migrate from SSH deployment](../guides/migrate-from-ssh.md).
4. **Legacy containers are visible or gone.** The server only finds containers labelled `com.docker.compose.project=<key>` or named `<key>-…` / `<key>_…`. Stop the others by hand before the stack's first deploy.
5. **Only the reverse proxy reaches the server.** `:8080` is never published, and deploy-server is on no network that stacks can join.
6. **Traefik is isolated from stacks.** Stacks reach it only through `ALLOWED_EXTERNAL_NETWORKS`. The deploy route is in the file provider, on `:8443`, towards a fixed IP; Traefik uses a socket proxy, `exposedByDefault=false`, no dashboard or API. Firewall `:8443` to the CI runners.
7. **`TRUSTED_PROXIES` is exact.** Only the proxy's address, never a Docker pool such as `172.16.0.0/12`: any peer in that range can forge the client IP.
8. **`ALLOWED_IPS` is set** to the CI runner egress addresses. It limits who can replay a leaked token.
9. **The server environment is minimal.** Only the variables of the configuration reference, plus `PATH`. No secrets: compose interpolation can copy any of them into a container.
10. **Host and container paths match** for `COMPOSE_BASE` and `WEBSITES_BASE`.
11. **The intermediate levels of `WEBSITES_BASE` belong to root.** `WEBSITES_BASE`, `<key>/` and `<key>/<service>/` are `root:root 0755`, writable by no other user and not on a shared or network filesystem.

:::warning
- Never list `deploy-internal` or `socket-proxy` in `ALLOWED_EXTERNAL_NETWORKS`: a stack could then reach the server directly, or the Docker API.
- Never widen `TRUSTED_PROXIES` to a network range.
- Never put secrets in the server's environment.
:::

## Private registries

Mount a docker `config.json` read-only on `/root/.docker/config.json`. Compose forwards these credentials to the daemon, so every stack can pull what they grant access to.

Next: [Security model](./security.md).
