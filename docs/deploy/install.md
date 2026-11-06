---
sidebar_position: 2
title: Install
description: Run Loch Deploy behind Traefik and a Docker socket proxy with the reference compose file, then check its health.
---

# Install

The container image is the supported way to run Loch Deploy. It runs on `linux/amd64` and `linux/arm64` and ships the docker CLI and the Compose plugin.

| Image tag | Points to |
|---|---|
| `ghcr.io/loch-sh/deploy:v1.0.0` | Exactly v1.0.0 |
| `ghcr.io/loch-sh/deploy:1.0` | Latest 1.0.x |
| `ghcr.io/loch-sh/deploy:1` | Latest 1.x |
| `ghcr.io/loch-sh/deploy:latest` | Latest release |

:::note
Prerequisites: Docker with Compose 2.23.1 or later, a GitLab instance (15.7+) reachable over HTTPS from the host, and a DNS name for the server (`deploy.example.com` below).
:::

## Reference topology

```text
Internet --:80/:443--> traefik --(web, shared)-----------------> tenant stacks
         --:8443------>   |
                          +--(deploy-internal, 172.31.250.0/29)--> deploy-server (172.31.250.3)
                          +--(socket-proxy, internal)--> docker-socket-proxy --> docker.sock
```

| Network | Members | Why |
|---|---|---|
| `web` | Traefik, tenant stacks | External, created beforehand. The only entry of `ALLOWED_EXTERNAL_NETWORKS` |
| `deploy-internal` | Traefik `172.31.250.2`, deploy-server `172.31.250.3` | Fixed IPs for `TRUSTED_PROXIES` and the route. Not internal: the server fetches the GitLab keys |
| `socket-proxy` | Traefik, `docker-socket-proxy` | Internal. Traefik reads a read-only Docker API, never the raw socket |

The deploy route is declared in Traefik's file provider, on a dedicated entrypoint `:8443`, towards the fixed IP. Tenant containers only feed the Docker provider, so their labels can neither shadow nor break it.

## Steps

1. Create the shared network and the data directories:

   ```bash
   docker network create web
   mkdir -p /data/compose /data/websites
   chown root:root /data/websites && chmod 0755 /data/websites
   ```

2. Download [docker-compose.example.yml](https://github.com/loch-sh/deploy/blob/v1.0.0/docker-compose.example.yml) as `docker-compose.yml`. Replace the `deploy-server` image with the published one:

   ```yaml
   services:
     deploy-server:
       image: ghcr.io/loch-sh/deploy:1.0
   ```

3. Replace the example values: host names, GitLab URL, namespaces, CI runner IPs (in both `ALLOWED_IPS` and the Traefik `ipAllowList`), ACME e-mail. Check that `172.31.250.0/29` is free on the host.

   ```yaml
   environment:
     DATA_DIR: "/app/data"
     GITLAB_ISSUER: "https://gitlab.example.com"
     GITLAB_AUDIENCE: "https://deploy.example.com"
     ALLOWED_NAMESPACES: "apps/atmosphere,infra"
     FORBIDDEN_TRAEFIK_HOSTS: "deploy.example.com,gitlab.example.com"
     ALLOWED_EXTERNAL_NETWORKS: "web"
     ALLOWED_IPS: "203.0.113.10"
     TRUSTED_PROXIES: "172.31.250.2"
   volumes:
     - ./data:/app/data
     - /var/run/docker.sock:/var/run/docker.sock
     - /data/compose:/data/compose     # same path on both sides
     - /data/websites:/data/websites   # same path on both sides
   ```

4. Start the stack:

   ```bash
   docker compose up -d
   ```

5. Firewall `:8443` on the host so that only the CI runner addresses reach it.

:::warning
- Never publish `:8080` and never add a `ports:` section to `deploy-server`.
- Mount the Docker socket without `:ro`: the flag covers the socket file, not the API, so it protects nothing.
- Mount `/data/compose` and `/data/websites` at the same path inside and outside the container. The policy checks bind sources in the container, the host daemon mounts them on the host.
:::

## Check

The image has a healthcheck on `GET /health`. Wait until the container is `healthy`, then read the startup logs:

```bash
docker compose ps deploy-server
docker compose logs deploy-server | grep -E 'starting|listening|WARN'
```

A warning about `ALLOWED_IPS` or `ALLOWED_NAMESPACES` means an allowlist is disabled: fix it before pipelines call the server. The server exits at startup when a variable is invalid or GitLab cannot be reached.

From a CI runner address:

```bash
curl https://deploy.example.com:8443/health
# {"status":"ok"}
```

## Binary

Each [GitHub Release](https://github.com/loch-sh/deploy/releases/tag/v1.0.0) has `deploy-server_v1.0.0_linux_amd64.tar.gz` and `deploy-server_v1.0.0_linux_arm64.tar.gz`, with a `.sha256` file and a provenance attestation. The archive holds the static binary, `LICENSE`, `README.md`, `SECURITY.md`, `docker-compose.example.yml` and `examples/`. The binary needs the `docker` CLI with the Compose plugin in its `PATH` and the same directory layout as the image. Set `DATA_DIR` explicitly: its default, `./data`, is relative to the working directory.

```bash
sha256sum -c deploy-server_v1.0.0_linux_amd64.tar.gz.sha256
gh attestation verify deploy-server_v1.0.0_linux_amd64.tar.gz --repo loch-sh/deploy
```

Next: [secure the configuration](./admin/configuration.md), then [deploy from GitLab CI](./guides/gitlab-ci.md). If stacks already run on the host, [migrate them](./guides/migrate-from-ssh.md) before opening `:8443`.
