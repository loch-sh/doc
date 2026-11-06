---
sidebar_position: 2
title: Security model
description: Who Loch Deploy trusts, why it runs as root with the Docker socket, the residual risks and what never to do.
---

# Security model

Loch Deploy holds the Docker socket and runs compose stacks for GitLab CI pipelines. Read this page before exposing it.

## Trust model

| Actor | Trust | What it can do |
|---|---|---|
| GitLab instance | Fully trusted | Signs the tokens. Whoever controls it, or its signing key, controls every stack |
| Pipeline of an allowed project | Trusted for its own stacks | Deploy any compose file that passes the policy, any image, any command through `/exec`, any environment name |
| Containers of a stack | Untrusted | Run arbitrary images, write into the stack's bind directories |
| Network clients | Untrusted | Reach the server through the reverse proxy only |

The server is built so that a pipeline's control does not extend to the host or to other projects' stacks: identity comes from the signed token, compose commands are pinned to the stack, ownership is recorded per `project_id`, and the policy refuses the compose features that grant host access. That boundary is not complete; see the risks below.

## Root with the Docker socket

The process runs as root in its container, on purpose: the socket is already root-equivalent on the host, and `/directories` must `chown` to arbitrary uids. The reference deployment drops every capability except `CHOWN`, `FOWNER` and `DAC_OVERRIDE`, sets `no-new-privileges` and a read-only root filesystem. This limits the container, not what goes through the socket.

**Any exploitable bug in the server, its policy or its dependencies is a root compromise of the host.**

## Residual risks

Assuming the [hardening checklist](./configuration.md#hardening-checklist) holds:

| ID | Risk | Level |
|---|---|---|
| A1 | Slug collision: two projects can map to the same stack key; the first deploy owns it | Medium |
| A2 | Symlink race on bind sources between validation and `up` (legacy containers the server cannot see) | Low |
| A3 | `${VAR}` interpolation reads the server environment | Low to Medium |
| A4 | Published `ports:` are allowed and bypass the proxy | Medium |
| A5 | A stack can route another stack's host name in Traefik, or break its routers | Medium |
| A6 | `container_name` squatting between keys sharing a prefix (DoS only) | Low |
| A7 | No CPU, memory, disk or stack-count quotas | Medium |
| A8 | Waiting for a docker slot is outside the time budget: a deploy can exceed 16 minutes | Low |
| A9 | The policy is a deny-list: new compose attributes are allowed by default | Low |
| A10 | A server compromise is host root | High impact |
| A11 | Tenant routers can attach to the deploy entrypoint `:8443` | Low |

Mechanisms and mitigations of each risk: [SECURITY.md](https://github.com/loch-sh/deploy/blob/v1.0.0/SECURITY.md#residual-risks).

Mitigations outside the server: a host firewall for published ports (A4), every sensitive host in `FORBIDDEN_TRAEFIK_HOSTS` (A5), and a review of the policy at every Compose upgrade (A9).

## Never

:::warning
- Publish `:8080`, or attach deploy-server to a network that stacks can join.
- Add `deploy-internal` or `socket-proxy` to `ALLOWED_EXTERNAL_NETWORKS`.
- Widen `TRUSTED_PROXIES` beyond the proxy's exact address.
- Put secrets in the server's environment.
- Run `-import-registry` while the server is running.
- Add a non-root `USER` to the image: the server needs root by design.
- Rely on `:ro` on the Docker socket: it protects the file, not the API.
:::

## Good to know

- Tokens are refused 10 minutes after issuance; 30 seconds of clock skew are tolerated.
- The audit log never contains the user's e-mail, only the GitLab login.
- Host tools that walk `WEBSITES_BASE` (backups, `chown -R`) must not follow symlinks: containers can create them in their own directories.
- Report security issues privately to the maintainers, not as public issues.
