---
sidebar_position: 1
title: Domains
description: See every domain routed by Traefik on the server, as a table or a graph, with its router, TLS, middlewares and container.
---

# Domains

**Network → Domains** opens the **Domain map**: every domain routed by Traefik on the server, whoever deployed it (a hosted site, a CI stack, a hand-written compose file). The page is read-only: domains are set in the [site settings](../hosting/sites.md) or in the Traefik labels of a stack.

:::note
Admin only.
:::

## Table view

| Column | Content |
|---|---|
| **Domain** | The host name |
| **Router** | The Traefik router that matches it |
| **Entrypoints** | `web`, `websecure`… |
| **TLS** | Whether HTTPS is on |
| **Middlewares** | Redirections, authentication, headers… |
| **Service** and **Container** | Where the traffic goes |
| **State** and **Image** | Of that container |

## Graph view

**Graph** draws each path: entrypoint → domain → router → service → container. Use it to see which container answers a domain, or which domains point to the same container.

## Filters

- Search a domain or a container.
- **Filter by TLD**.
- **Active** shows only the domains whose container runs; **All** also shows the others.

```bash
loch domains
```

## Good to know

- The map is built from the Traefik routers: a domain missing here is not routed. Check the DNS and the Traefik labels.
- The home page shows the 5 latest domains.
